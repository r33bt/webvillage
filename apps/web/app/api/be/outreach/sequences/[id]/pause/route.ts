// apps/web/app/api/be/outreach/sequences/[id]/pause/route.ts
// Slice 10: pause an active sequence — cancel future jobs, leave terminal recipients alone.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const RequestSchema = z.object({
  reason: z.string().max(500).optional(),
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

  const { data: seq } = await sb.from('wv_be_outreach_sequences').select('id, client_id, status').eq('id', id).is('deleted_at', null).maybeSingle()
  if (!seq) return NextResponse.json({ error: 'sequence_not_found' }, { status: 404 })
  if (seq.status !== 'active') {
    return NextResponse.json({ error: 'not_active', current_state: seq.status }, { status: 409 })
  }

  // Cancel pending jobs for this sequence
  const { data: cancelledJobs, count: cancelCount } = await sb
    .from('wv_be_jobs')
    .update({ status: 'failed', last_error: body.reason ?? 'sequence_paused', completed_at: new Date().toISOString() }, { count: 'exact' })
    .eq('job_type', 'outreach_touch_send')
    .eq('status', 'pending')
    .filter('payload->>sequence_id', 'eq', id)
    .select('id')

  void cancelledJobs

  // Update sequence
  await sb.from('wv_be_outreach_sequences').update({ status: 'paused' }).eq('id', id)
  // Reset 'sending' recipients to 'pending' (resumable)
  await sb.from('wv_be_outreach_recipients').update({ status: 'pending' }).eq('sequence_id', id).eq('status', 'sending')

  await sb.from('wv_be_audit_log').insert({
    client_id: seq.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'sequence_paused',
    target_table: 'wv_be_outreach_sequences',
    target_id: id,
    after_state: { jobs_cancelled: cancelCount ?? 0, reason: body.reason ?? null },
  })

  return NextResponse.json({ sequence_id: id, jobs_cancelled: cancelCount ?? 0, status: 'paused' })
}
