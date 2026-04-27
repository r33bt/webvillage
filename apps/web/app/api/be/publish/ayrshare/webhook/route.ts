// apps/web/app/api/be/publish/ayrshare/webhook/route.ts
// Slice 8: Ayrshare status callback receiver. Public route — gated by HMAC signature.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { verifyAyrshareWebhookSignature } from '@/lib/ayrshare-webhook-verify'

export const runtime = 'nodejs'

const PlatformResultSchema = z.object({
  status: z.enum(['success', 'error']),
  external_post_id: z.string().optional().nullable(),
  external_url: z.string().optional().nullable(),
  error_code: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
})

const WebhookSchema = z.object({
  event_id: z.string().optional(),
  event_type: z.enum(['post_succeeded', 'post_failed', 'post_scheduled', 'post_cancelled']),
  ayrshare_post_id: z.string(),
  platforms_status: z.record(z.string(), PlatformResultSchema).optional().default({}),
  occurred_at: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('x-ayrshare-signature') ?? req.headers.get('x-webhook-signature')
  if (!verifyAyrshareWebhookSignature(rawBody, sig)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let payload: z.infer<typeof WebhookSchema>
  try {
    payload = WebhookSchema.parse(JSON.parse(rawBody))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  // Find publish row by ayrshare_post_id
  const { data: pub } = await sb
    .from('wv_be_publishes')
    .select('id, client_id, status, metadata')
    .eq('ayrshare_post_id', payload.ayrshare_post_id)
    .maybeSingle()

  if (!pub) {
    await sb.from('wv_be_audit_log').insert({
      client_id: null,
      actor_user_id: null,
      actor_type: 'webhook',
      action: 'publish_webhook_unmapped',
      target_table: null,
      target_id: null,
      after_state: { ayrshare_post_id: payload.ayrshare_post_id, event_type: payload.event_type },
    })
    return NextResponse.json({ error: 'unmapped_post_id' }, { status: 404 })
  }

  // Idempotency: if event_type already reflected in current status, return 200 with duplicate flag
  const isDuplicate =
    (payload.event_type === 'post_succeeded' && pub.status === 'published') ||
    (payload.event_type === 'post_failed' && pub.status === 'failed') ||
    (payload.event_type === 'post_cancelled' && pub.status === 'cancelled')

  if (isDuplicate) {
    return NextResponse.json({ received: true, publish_id: pub.id, duplicate: true })
  }

  // Determine new status from event_type + per-platform breakdown
  let newStatus: 'published' | 'failed' | 'cancelled' = pub.status as never
  let failureReason: string | null = null

  const perPlatform = payload.platforms_status ?? {}
  const platformList = Object.keys(perPlatform)
  const successCount = platformList.filter((p) => perPlatform[p]?.status === 'success').length
  const errorCount = platformList.filter((p) => perPlatform[p]?.status === 'error').length

  if (payload.event_type === 'post_succeeded') {
    if (successCount > 0) {
      newStatus = 'published'
    } else if (errorCount > 0) {
      newStatus = 'failed'
      failureReason = platformList
        .filter((p) => perPlatform[p]?.status === 'error')
        .map((p) => `${p}: ${perPlatform[p]?.error_message ?? perPlatform[p]?.error_code ?? 'unknown'}`)
        .join('; ')
        .slice(0, 500)
    }
  } else if (payload.event_type === 'post_failed') {
    newStatus = 'failed'
    failureReason = Object.values(perPlatform)
      .map((s) => s.error_message ?? s.error_code ?? 'unknown')
      .join('; ')
      .slice(0, 500)
  } else if (payload.event_type === 'post_cancelled') {
    newStatus = 'cancelled'
  }

  // Update publish row
  const updates: Record<string, unknown> = {
    status: newStatus,
    response_payload: payload as unknown as Record<string, unknown>,
    metadata: { ...(pub.metadata as object), per_platform_status: perPlatform },
  }
  if (newStatus === 'published') {
    updates.published_at = payload.occurred_at ?? new Date().toISOString()
  }
  if (failureReason) {
    updates.failure_reason = failureReason
  }
  await sb.from('wv_be_publishes').update(updates).eq('id', pub.id)

  // Update draft.published_at if applicable
  if (newStatus === 'published') {
    const { data: pubFull } = await sb.from('wv_be_publishes').select('draft_id').eq('id', pub.id).single()
    if (pubFull?.draft_id) {
      await sb
        .from('wv_be_drafts')
        .update({ published_at: payload.occurred_at ?? new Date().toISOString(), scheduled_for: null })
        .eq('id', pubFull.draft_id)
    }
  }

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: pub.client_id,
    actor_user_id: null,
    actor_type: 'webhook',
    action: newStatus === 'published' ? 'publish_succeeded' : newStatus === 'failed' ? 'publish_failed' : 'publish_webhook_received',
    target_table: 'wv_be_publishes',
    target_id: pub.id,
    after_state: { event_type: payload.event_type, status: newStatus, success_count: successCount, error_count: errorCount },
  })

  // Slice 9 cross-slice handshake (§6.2): refresh editorial calendar MV on publish status change
  // Non-blocking — fire-and-forget. ~50-200ms cost; calendar reflects new publishes within seconds.
  if (newStatus === 'published' || newStatus === 'failed') {
    sb.rpc('refresh_wv_be_mv_editorial_calendar').then(({ error }) => {
      if (error) console.warn('[ayrshare webhook] calendar refresh failed (non-fatal):', error.message)
    })
  }

  return NextResponse.json({ received: true, publish_id: pub.id, new_status: newStatus })
}
