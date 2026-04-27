// apps/web/app/api/be/outreach/sequences/[id]/route.ts
// Slice 10: GET sequence detail with per-touch + per-recipient stats.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()
  const [{ data: seq }, { data: recipients }, { data: messages }] = await Promise.all([
    sb.from('wv_be_outreach_sequences').select('*').eq('id', id).is('deleted_at', null).maybeSingle(),
    sb.from('wv_be_outreach_recipients').select('*').eq('sequence_id', id).is('deleted_at', null).order('created_at', { ascending: false }).limit(1000),
    sb.from('wv_be_outreach_messages').select('*').eq('sequence_id', id).order('sent_at', { ascending: true }).limit(5000),
  ])

  if (!seq) return NextResponse.json({ error: 'sequence_not_found' }, { status: 404 })

  // Build per-touch stats
  const touchCount = (seq.template_ids as string[]).length
  const touches = Array.from({ length: touchCount }).map((_, i) => {
    const touchIdx = i + 1
    const msgsForTouch = (messages ?? []).filter((m) => m.step_index === touchIdx)
    return {
      touch_index: touchIdx,
      day_offset: (seq.cadence_days as number[])[i],
      template_id: (seq.template_ids as string[])[i],
      sent_count: msgsForTouch.filter((m) => m.sent_at).length,
      delivered_count: msgsForTouch.filter((m) => m.delivered_at).length,
      open_count: msgsForTouch.reduce((s, m) => s + ((m.open_count as number | null) ?? 0), 0),
      click_count: msgsForTouch.reduce((s, m) => s + ((m.click_count as number | null) ?? 0), 0),
      reply_count: msgsForTouch.filter((m) => m.reply_received_at).length,
      bounce_count: msgsForTouch.filter((m) => m.send_failure_reason).length,
    }
  })

  // Group messages by recipient_id for timeline
  const messagesByRecipient = new Map<string, typeof messages>()
  for (const m of messages ?? []) {
    const rid = m.recipient_id as string | null
    if (!rid) continue
    if (!messagesByRecipient.has(rid)) messagesByRecipient.set(rid, [])
    messagesByRecipient.get(rid)!.push(m)
  }

  const recipientsWithTimeline = (recipients ?? []).map((r) => ({
    ...r,
    timeline: (messagesByRecipient.get(r.id as string) ?? []).map((m) => ({
      touch_index: m.step_index,
      sent_at: m.sent_at,
      delivered_at: m.delivered_at,
      opened_at: m.last_opened_at,
      replied_at: m.reply_received_at,
      bounced_at: m.send_failure_reason ? m.sent_at : null,
      resend_message_id: m.resend_message_id,
    })),
  }))

  // Rollup
  const sentTotal = (messages ?? []).filter((m) => m.sent_at).length
  const deliveredTotal = (messages ?? []).filter((m) => m.delivered_at).length
  const openTotal = (messages ?? []).reduce((s, m) => s + ((m.open_count as number | null) ?? 0), 0)
  const replyTotal = (recipients ?? []).filter((r) => r.replied_at).length
  const bounceTotal = (recipients ?? []).filter((r) => r.bounced_at).length
  const spamTotal = (recipients ?? []).filter((r) => r.marked_spam_at).length
  const eligibleRemaining = (recipients ?? []).filter((r) => r.status === 'pending').length

  return NextResponse.json({
    sequence: seq,
    touches,
    recipients: recipientsWithTimeline,
    rollup: {
      total_recipients: recipients?.length ?? 0,
      eligible_remaining: eligibleRemaining,
      sent_total: sentTotal,
      delivered_total: deliveredTotal,
      open_total: openTotal,
      open_rate: deliveredTotal > 0 ? openTotal / deliveredTotal : 0,
      reply_rate: deliveredTotal > 0 ? replyTotal / deliveredTotal : 0,
      bounce_rate: sentTotal > 0 ? bounceTotal / sentTotal : 0,
      spam_rate: sentTotal > 0 ? spamTotal / sentTotal : 0,
      reply_total: replyTotal,
      bounce_total: bounceTotal,
      spam_total: spamTotal,
    },
  })
}
