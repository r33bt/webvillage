// apps/web/app/api/be/publish/[publish_id]/cancel/route.ts
// Slice 8: cancel a queued publish (Q8-4 — 60-sec deadline before scheduled_for).

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const RequestSchema = z.object({
  reason: z.string().max(500).optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ publish_id: string }> }) {
  const { publish_id } = await params
  if (!z.string().uuid().safeParse(publish_id).success) {
    return NextResponse.json({ error: 'invalid_publish_id' }, { status: 400 })
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
  const { data: pub } = await sb.from('wv_be_publishes').select('*').eq('id', publish_id).maybeSingle()
  if (!pub) return NextResponse.json({ error: 'publish_not_found' }, { status: 404 })

  if (pub.status !== 'queued') {
    return NextResponse.json({ error: 'not_cancellable', current_state: pub.status }, { status: 409 })
  }

  // Q8-4 deadline check
  if (pub.scheduled_for) {
    const scheduled = new Date(pub.scheduled_for as string).getTime()
    if (scheduled - Date.now() < 60_000) {
      return NextResponse.json(
        { error: 'cancel_deadline_passed', detail: 'publish fires within 60 sec; cannot cancel' },
        { status: 409 }
      )
    }
  }

  // Atomic cancel: update both publish + job (best-effort sequential since we don't have an SQL function)
  const { error: pubErr } = await sb
    .from('wv_be_publishes')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), failure_reason: body.reason ?? 'founder_cancelled' })
    .eq('id', publish_id)
    .eq('status', 'queued')  // CAS — only update if still queued (race with cron tick)

  if (pubErr) {
    return NextResponse.json({ error: 'cancel_persist_failed', detail: pubErr.message }, { status: 500 })
  }

  // Cancel the job too
  await sb
    .from('wv_be_jobs')
    .update({ status: 'failed', last_error: 'cancelled_by_founder', completed_at: new Date().toISOString() })
    .eq('job_type', 'publish')
    .filter('payload->>publish_id', 'eq', publish_id)
    .eq('status', 'pending')

  // Clear draft.scheduled_for
  await sb.from('wv_be_drafts').update({ scheduled_for: null }).eq('id', pub.draft_id)

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: pub.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'publish_cancelled',
    target_table: 'wv_be_publishes',
    target_id: publish_id,
    after_state: { reason: body.reason ?? null },
  })

  return NextResponse.json({
    publish_id,
    cancelled_at: new Date().toISOString(),
    status: 'cancelled',
  })
}
