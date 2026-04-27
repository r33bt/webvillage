// apps/web/app/api/be/outreach/sequences/[id]/send/route.ts
// Slice 10: kick off sequence — enqueues Touch 1 jobs for every eligible recipient.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const COST_PER_TOUCH_CENTS = 5  // ~$0.04 generation + ~$0.0005 Resend send (Free tier 3K/mo)
const COST_HARD_CAP_CENTS = 500
const COST_SOFT_WARNING_CENTS = 50

const RequestSchema = z.object({
  confirm_estimate_cost_cents: z.number().int().min(0).optional(),
  send_window_start_at: z.string().datetime().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
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

  const { data: seq } = await sb.from('wv_be_outreach_sequences').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
  if (!seq) return NextResponse.json({ error: 'sequence_not_found' }, { status: 404 })

  if (!['draft', 'paused'].includes(seq.status as string)) {
    return NextResponse.json({ error: 'invalid_state', current_state: seq.status, allowed: ['draft', 'paused'] }, { status: 409 })
  }

  // Voice profile check (mirror Slice 3 412)
  const { data: vp } = await sb.from('wv_be_voice_profiles').select('id').eq('client_id', seq.client_id).maybeSingle()
  if (!vp) {
    return NextResponse.json({ error: 'voice_profile_required' }, { status: 412 })
  }

  // Count eligible recipients
  const { data: eligible } = await sb
    .from('wv_be_outreach_recipients')
    .select('id, email')
    .eq('sequence_id', id)
    .eq('status', 'pending')
    .is('opted_out_at', null)
    .is('bounced_at', null)
    .is('marked_spam_at', null)
    .is('replied_at', null)
    .is('deleted_at', null)

  const eligibleCount = eligible?.length ?? 0
  if (eligibleCount === 0) {
    return NextResponse.json({ error: 'no_eligible_recipients' }, { status: 422 })
  }

  // Cost estimate
  const cadenceLen = (seq.cadence_days as number[]).length
  const estimatedCents = eligibleCount * cadenceLen * COST_PER_TOUCH_CENTS

  if (estimatedCents > COST_HARD_CAP_CENTS) {
    return NextResponse.json(
      { error: 'cost_exceeds_hard_cap', estimated_cost_cents: estimatedCents, hard_cap_cents: COST_HARD_CAP_CENTS, hint: 'Split into smaller sequences' },
      { status: 422 }
    )
  }
  if (estimatedCents > COST_SOFT_WARNING_CENTS && body.confirm_estimate_cost_cents !== estimatedCents) {
    return NextResponse.json(
      { error: 'cost_confirmation_required', estimated_cost_cents: estimatedCents, soft_warning_cents: COST_SOFT_WARNING_CENTS, hint: `Re-fire with confirm_estimate_cost_cents: ${estimatedCents}` },
      { status: 409 }
    )
  }

  // Send window
  const sendAt = body.send_window_start_at ?? new Date().toISOString()

  // Enqueue Touch 1 jobs
  const jobInserts = (eligible ?? []).map((r) => ({
    client_id: seq.client_id,
    job_type: 'outreach_touch_send',
    payload: {
      sequence_id: id,
      recipient_id: r.id,
      touch_index: 1,
      send_at: sendAt,
    },
    status: 'pending',
  }))
  const { error: jobErr } = await sb.from('wv_be_jobs').insert(jobInserts)
  if (jobErr) {
    return NextResponse.json({ error: 'job_enqueue_failed', detail: jobErr.message }, { status: 500 })
  }

  // Update sequence status
  await sb.from('wv_be_outreach_sequences').update({ status: 'active' }).eq('id', id)
  // Mark recipients as 'sending'
  await sb.from('wv_be_outreach_recipients').update({ status: 'sending' }).eq('sequence_id', id).eq('status', 'pending')

  await sb.from('wv_be_audit_log').insert({
    client_id: seq.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'sequence_sent_kickoff',
    target_table: 'wv_be_outreach_sequences',
    target_id: id,
    after_state: { eligible_count: eligibleCount, jobs_enqueued: jobInserts.length, estimated_cost_cents: estimatedCents, send_window_start_at: sendAt },
  })

  return NextResponse.json({
    sequence_id: id,
    eligible_recipient_count: eligibleCount,
    jobs_enqueued: jobInserts.length,
    estimated_total_cost_cents: estimatedCents,
    status: 'active',
    send_window_start_at: sendAt,
  }, { status: 202 })
}
