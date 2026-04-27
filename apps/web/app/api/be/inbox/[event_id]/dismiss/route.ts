// apps/web/app/api/be/inbox/[event_id]/dismiss/route.ts
// Slice 7: dismiss event without reply. Sets local dismissed_at + best-effort upstream mark-read.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { decryptToken } from '@/lib/be-token-encryption'
import { markEventRead } from '@/lib/vista-client'

export const runtime = 'nodejs'

const RequestSchema = z.object({
  reason: z.string().max(500).optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = await params
  if (!z.string().uuid().safeParse(event_id).success) {
    return NextResponse.json({ error: 'invalid_event_id' }, { status: 400 })
  }

  let body: z.infer<typeof RequestSchema>
  try {
    body = RequestSchema.parse((await req.json().catch(() => ({}))) ?? {})
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  const { data: event } = await sb.from('wv_be_inbox_events').select('id, client_id, source_external_id').eq('id', event_id).maybeSingle()
  if (!event) return NextResponse.json({ error: 'event_not_found' }, { status: 404 })

  const dismissedAt = new Date().toISOString()
  await sb
    .from('wv_be_inbox_events')
    .update({ dismissed_at: dismissedAt, dismiss_reason: body.reason ?? null })
    .eq('id', event_id)

  // Best-effort upstream mark-read (Q7-12)
  let upstreamSupported = false
  try {
    const { data: cred } = await sb
      .from('wv_be_platform_credentials')
      .select('oauth_access_token_encrypted')
      .eq('client_id', event.client_id)
      .eq('platform', 'vista_linkedin')
      .is('deleted_at', null)
      .maybeSingle()
    if (cred && event.source_external_id) {
      const token = decryptToken(cred.oauth_access_token_encrypted as string)
      const result = await markEventRead({ externalId: event.source_external_id as string, accessToken: token })
      upstreamSupported = result.supported
    }
  } catch (err) {
    console.warn('[dismiss] upstream mark-read failed (non-fatal):', err)
  }

  await sb.from('wv_be_audit_log').insert({
    client_id: event.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'inbox_event_dismissed',
    target_table: 'wv_be_inbox_events',
    target_id: event_id,
    after_state: { reason: body.reason ?? null, upstream_mark_read: upstreamSupported },
  })

  return NextResponse.json({ inbox_event_id: event_id, dismissed_at: dismissedAt, upstream_mark_read: upstreamSupported })
}
