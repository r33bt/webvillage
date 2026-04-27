// apps/web/app/api/be/outreach/resend/webhook/route.ts
// Slice 10: Resend webhook receiver. Public — gated by Svix HMAC signature.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { verifyResendWebhookSignature } from '@/lib/resend-webhook-verify'

export const runtime = 'nodejs'

const WebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    email_id: z.string().optional(),
    bounce_type: z.enum(['hard', 'soft']).optional(),
    to: z.union([z.string(), z.array(z.string())]).optional(),
  }).passthrough(),
  created_at: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('svix-signature')
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')

  if (!verifyResendWebhookSignature(rawBody, sig, svixId, svixTimestamp)) {
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

  // Idempotent webhook event log
  const { data: existing } = await sb
    .from('wv_be_outreach_webhook_events')
    .select('id')
    .eq('resend_event_id', svixId!)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  await sb.from('wv_be_outreach_webhook_events').insert({
    resend_event_id: svixId,
    event_type: payload.type,
    resend_message_id: payload.data.email_id ?? null,
    payload: payload as unknown as Record<string, unknown>,
  })

  // Find the outreach message
  const messageId = payload.data.email_id
  if (!messageId) {
    return NextResponse.json({ received: true, ignored: true, reason: 'no_email_id' })
  }
  const { data: message } = await sb
    .from('wv_be_outreach_messages')
    .select('id, client_id, recipient_id')
    .eq('resend_message_id', messageId)
    .maybeSingle()

  if (!message) {
    await sb.from('wv_be_audit_log').insert({
      client_id: null,
      actor_user_id: null,
      actor_type: 'webhook',
      action: 'resend_webhook_unmapped_message',
      target_table: 'wv_be_outreach_messages',
      target_id: null,
      after_state: { resend_message_id: messageId, event_type: payload.type },
    })
    return NextResponse.json({ error: 'message_not_found' }, { status: 404 })
  }

  const recipientId = message.recipient_id as string | null

  // Branch by event type
  switch (payload.type) {
    case 'email.sent':
      await sb.from('wv_be_outreach_messages').update({ sent_confirmed_at: new Date().toISOString() }).eq('id', message.id)
      break

    case 'email.delivered':
      await sb.from('wv_be_outreach_messages').update({ delivered_at: new Date().toISOString() }).eq('id', message.id)
      break

    case 'email.opened':
      // Increment-by-1 via raw SQL alternative; for simplicity fetch + update
      {
        const { data: cur } = await sb.from('wv_be_outreach_messages').select('open_count').eq('id', message.id).single()
        await sb.from('wv_be_outreach_messages').update({ open_count: ((cur?.open_count as number | undefined) ?? 0) + 1, last_opened_at: new Date().toISOString() }).eq('id', message.id)
      }
      break

    case 'email.clicked':
      {
        const { data: cur } = await sb.from('wv_be_outreach_messages').select('click_count').eq('id', message.id).single()
        await sb.from('wv_be_outreach_messages').update({ click_count: ((cur?.click_count as number | undefined) ?? 0) + 1, last_clicked_at: new Date().toISOString() }).eq('id', message.id)
      }
      break

    case 'email.bounced': {
      const bounceType = payload.data.bounce_type ?? 'hard'
      await sb.from('wv_be_outreach_messages').update({ send_failure_reason: `bounce:${bounceType}` }).eq('id', message.id)
      if (recipientId) {
        await sb.from('wv_be_outreach_recipients').update({ status: 'bounced', bounced_at: new Date().toISOString(), bounced_type: bounceType }).eq('id', recipientId)
        // Cancel future jobs
        await sb.from('wv_be_jobs').update({ status: 'failed', last_error: `recipient_bounced_${bounceType}`, completed_at: new Date().toISOString() }).eq('job_type', 'outreach_touch_send').eq('status', 'pending').filter('payload->>recipient_id', 'eq', recipientId)
      }
      break
    }

    case 'email.complained':
      if (recipientId) {
        await sb.from('wv_be_outreach_recipients').update({ status: 'spam', marked_spam_at: new Date().toISOString() }).eq('id', recipientId)
        await sb.from('wv_be_jobs').update({ status: 'failed', last_error: 'recipient_marked_spam', completed_at: new Date().toISOString() }).eq('job_type', 'outreach_touch_send').eq('status', 'pending').filter('payload->>recipient_id', 'eq', recipientId)
      }
      // Q10-8 — single complaint = founder alert (audit row + future Resend ops email; defer the email send for now)
      await sb.from('wv_be_audit_log').insert({
        client_id: message.client_id,
        actor_user_id: null,
        actor_type: 'webhook',
        action: 'outreach_spam_complaint',
        target_table: 'wv_be_outreach_messages',
        target_id: message.id,
        after_state: { recipient_id: recipientId, severity: 'critical_deliverability_risk' },
      })
      break

    case 'email.delivery_delayed':
      await sb.from('wv_be_outreach_messages').update({ delayed_at: new Date().toISOString() }).eq('id', message.id)
      break

    case 'email.replied':
      if (recipientId) {
        await sb.from('wv_be_outreach_messages').update({ reply_received_at: new Date().toISOString() }).eq('id', message.id)
        await sb.from('wv_be_outreach_recipients').update({ status: 'replied', replied_at: new Date().toISOString() }).eq('id', recipientId)
        await sb.from('wv_be_jobs').update({ status: 'failed', last_error: 'recipient_replied', completed_at: new Date().toISOString() }).eq('job_type', 'outreach_touch_send').eq('status', 'pending').filter('payload->>recipient_id', 'eq', recipientId)
        await sb.from('wv_be_audit_log').insert({
          client_id: message.client_id,
          actor_user_id: null,
          actor_type: 'webhook',
          action: 'recipient_replied',
          target_table: 'wv_be_outreach_recipients',
          target_id: recipientId,
          after_state: { resend_event_id: svixId },
        })
      }
      break

    default:
      // Unknown event type — already logged in webhook_events
      break
  }

  // Mark webhook event processed
  await sb.from('wv_be_outreach_webhook_events').update({ processed_at: new Date().toISOString() }).eq('resend_event_id', svixId!)

  return NextResponse.json({ received: true, message_id: message.id, event_type: payload.type })
}
