// apps/web/app/api/be/inbox/vista/webhook/route.ts
// Slice 7: Vista Social inbound webhook receiver. Public route — gated by HMAC signature.
// COMING_SOON middleware allows /api/* through (per S214 launch gate config).

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { verifyVistaWebhookSignature } from '@/lib/vista-webhook-verify'

export const runtime = 'nodejs'
export const maxDuration = 30

const WebhookSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.enum(['mention', 'dm', 'comment', 'reaction']),
  workspace_id: z.string().min(1),
  platform: z.string(),
  source_handle: z.string().optional().nullable(),
  source_display_name: z.string().optional().nullable(),
  source_external_id: z.string().optional().nullable(),
  source_payload: z.record(z.string(), z.unknown()).optional().default({}),
  source_excerpt: z.string().optional().nullable(),
  occurred_at: z.string().datetime().optional().nullable(),
})

function extractExcerpt(payload: Record<string, unknown>, max: number = 200): string {
  // Best-effort: try common field names
  const candidates = ['body', 'text', 'content', 'message', 'comment_text']
  for (const k of candidates) {
    if (typeof payload[k] === 'string') return (payload[k] as string).slice(0, max)
  }
  return ''
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('x-vista-signature') ?? req.headers.get('x-webhook-signature')
  if (!verifyVistaWebhookSignature(rawBody, sig)) {
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

  // Slice 7 phase 1: only LinkedIn supported (Q7-9)
  if (payload.platform !== 'linkedin') {
    return NextResponse.json({ received: true, ignored: true, reason: 'platform_not_in_phase_1' }, { status: 200 })
  }

  const sb = createSupabaseServiceClient()

  // Map workspace_id → client_id via wv_be_platform_credentials.external_workspace_id
  const { data: cred } = await sb
    .from('wv_be_platform_credentials')
    .select('client_id')
    .eq('external_workspace_id', payload.workspace_id)
    .like('platform', 'vista_%')
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()

  if (!cred) {
    // Audit-log + 404
    await sb.from('wv_be_audit_log').insert({
      client_id: null,
      actor_user_id: null,
      actor_type: 'webhook',
      action: 'vista_webhook_unmapped_workspace',
      target_table: null,
      target_id: null,
      after_state: { workspace_id: payload.workspace_id, vista_event_id: payload.event_id, platform: payload.platform },
    })
    return NextResponse.json({ error: 'workspace_not_mapped' }, { status: 404 })
  }

  const clientId = cred.client_id as string

  // Idempotent insert — UNIQUE on vista_event_id; on conflict, fetch existing
  const { data: inserted, error: insertErr } = await sb
    .from('wv_be_inbox_events')
    .insert({
      client_id: clientId,
      vista_event_id: payload.event_id,
      platform: payload.platform,
      event_type: payload.event_type,
      source_handle: payload.source_handle ?? null,
      source_display_name: payload.source_display_name ?? null,
      source_external_id: payload.source_external_id ?? null,
      source_payload: payload.source_payload ?? {},
      source_excerpt: payload.source_excerpt ?? extractExcerpt(payload.source_payload ?? {}),
      occurred_at: payload.occurred_at ?? null,
    })
    .select('id')
    .single()

  let inboxEventId: string
  let duplicate = false
  if (insertErr) {
    // Likely UNIQUE conflict; fetch existing
    if (insertErr.code === '23505') {
      const { data: existing } = await sb
        .from('wv_be_inbox_events')
        .select('id')
        .eq('vista_event_id', payload.event_id)
        .maybeSingle()
      if (!existing) {
        return NextResponse.json({ error: 'persist_failed', detail: insertErr.message }, { status: 500 })
      }
      inboxEventId = existing.id as string
      duplicate = true
    } else {
      return NextResponse.json({ error: 'persist_failed', detail: insertErr.message }, { status: 500 })
    }
  } else {
    inboxEventId = inserted!.id as string
  }

  // Audit log
  await sb.from('wv_be_audit_log').insert({
    client_id: clientId,
    actor_user_id: null,
    actor_type: 'webhook',
    action: 'vista_inbox_webhook_received',
    target_table: 'wv_be_inbox_events',
    target_id: inboxEventId,
    after_state: { event_type: payload.event_type, vista_event_id: payload.event_id, duplicate },
  })

  return NextResponse.json({ received: true, inbox_event_id: inboxEventId, duplicate })
}
