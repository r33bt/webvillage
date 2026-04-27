// apps/web/app/api/be/publish/[publish_id]/route.ts
// Slice 8: GET single publish detail; PATCH reschedule (Q8-8).

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const PatchSchema = z.object({
  scheduled_for: z.string().datetime(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ publish_id: string }> }) {
  const { publish_id } = await params
  if (!z.string().uuid().safeParse(publish_id).success) {
    return NextResponse.json({ error: 'invalid_publish_id' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()
  const { data: pub } = await sb.from('wv_be_publishes').select('*').eq('id', publish_id).maybeSingle()
  if (!pub) return NextResponse.json({ error: 'publish_not_found' }, { status: 404 })

  // Status timeline from audit log
  const { data: audits } = await sb
    .from('wv_be_audit_log')
    .select('action, after_state, actor_type, occurred_at')
    .eq('target_table', 'wv_be_publishes')
    .eq('target_id', publish_id)
    .order('occurred_at', { ascending: true })

  // Retry chain: walk parent_publish_id backward
  const retryChain: Array<{ publish_id: string; status: string; failure_reason: string | null; created_at: string }> = []
  let current = pub.parent_publish_id as string | null
  while (current && retryChain.length < 10) {
    const { data: parent } = await sb
      .from('wv_be_publishes')
      .select('id, status, failure_reason, created_at, parent_publish_id')
      .eq('id', current)
      .maybeSingle()
    if (!parent) break
    retryChain.push({
      publish_id: parent.id as string,
      status: parent.status as string,
      failure_reason: parent.failure_reason as string | null,
      created_at: parent.created_at as string,
    })
    current = parent.parent_publish_id as string | null
  }

  // Draft summary (for detail view)
  const { data: draft } = await sb
    .from('wv_be_drafts')
    .select('id, draft_body, status')
    .eq('id', pub.draft_id)
    .maybeSingle()

  return NextResponse.json({
    publish: pub,
    status_timeline: audits ?? [],
    retry_history: retryChain,
    draft_summary: draft
      ? {
          draft_id: draft.id,
          status: draft.status,
          body_excerpt: ((draft.draft_body as string) ?? '').slice(0, 300),
        }
      : null,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ publish_id: string }> }) {
  const { publish_id } = await params
  if (!z.string().uuid().safeParse(publish_id).success) {
    return NextResponse.json({ error: 'invalid_publish_id' }, { status: 400 })
  }

  let body: z.infer<typeof PatchSchema>
  try {
    body = PatchSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const newScheduled = new Date(body.scheduled_for)
  if (newScheduled.getTime() < Date.now() + 60_000) {
    return NextResponse.json({ error: 'scheduled_too_soon', detail: 'must be > now() + 60s' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()
  const { data: pub } = await sb.from('wv_be_publishes').select('*').eq('id', publish_id).maybeSingle()
  if (!pub) return NextResponse.json({ error: 'publish_not_found' }, { status: 404 })
  if (pub.status !== 'queued') {
    return NextResponse.json({ error: 'not_in_queued_state', current_state: pub.status }, { status: 409 })
  }

  const previousScheduled = pub.scheduled_for
  await sb
    .from('wv_be_publishes')
    .update({ scheduled_for: newScheduled.toISOString() })
    .eq('id', publish_id)

  // Update the corresponding job's payload (next cron tick uses payload values)
  await sb
    .from('wv_be_jobs')
    .update({ payload: { ...(pub.metadata as object), publish_id, scheduled_for: newScheduled.toISOString() } })
    .eq('job_type', 'publish')
    .filter('payload->>publish_id', 'eq', publish_id)
    .eq('status', 'pending')

  // Update draft.scheduled_for
  await sb.from('wv_be_drafts').update({ scheduled_for: newScheduled.toISOString() }).eq('id', pub.draft_id)

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: pub.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'publish_rescheduled',
    target_table: 'wv_be_publishes',
    target_id: publish_id,
    before_state: { scheduled_for: previousScheduled },
    after_state: { scheduled_for: newScheduled.toISOString() },
  })

  return NextResponse.json({
    publish_id,
    scheduled_for: newScheduled.toISOString(),
    previous_scheduled_for: previousScheduled,
  })
}
