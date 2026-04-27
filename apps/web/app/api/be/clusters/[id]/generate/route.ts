// apps/web/app/api/be/clusters/[id]/generate/route.ts
// Brand Engine Slice 6: kick off batched generation. Enqueues a wv_be_jobs row.
// Vercel cron /api/be/jobs/tick processes the job (one slot per tick — Vercel safety).

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import {
  CLUSTER_COST_HARD_CAP_CENTS,
  CLUSTER_COST_SOFT_WARNING_CENTS,
  estimateClusterCostCents,
} from '@/lib/be-cluster-cost'

export const runtime = 'nodejs'
export const maxDuration = 30

const GenerateSchema = z.object({
  start_from_slot_index: z.number().int().min(1).optional(),
  confirm_cost_cents: z.number().int().min(0).optional(),
  force: z.boolean().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: z.infer<typeof GenerateSchema>
  try {
    body = GenerateSchema.parse((await req.json().catch(() => ({}))) ?? {})
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  // Fetch cluster + slots
  const { data: cluster } = await sb.from('wv_be_clusters').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
  if (!cluster) return NextResponse.json({ error: 'cluster_not_found' }, { status: 404 })

  // State guard
  const allowedStates = ['planning', 'paused']
  if (body.force) allowedStates.push('completed')
  if (!allowedStates.includes(cluster.status as string)) {
    return NextResponse.json(
      { error: 'invalid_cluster_state', current_state: cluster.status, allowed: allowedStates },
      { status: 409 }
    )
  }

  // Fetch slots
  const { data: allSlots } = await sb
    .from('wv_be_cluster_slots')
    .select('id, slot_index, status')
    .eq('cluster_id', id)
    .order('slot_index', { ascending: true })

  const startIdx = body.start_from_slot_index ?? 1
  const slotsToProcess = (allSlots ?? []).filter((s) => (s.slot_index as number) >= startIdx)
  if (slotsToProcess.length === 0) {
    return NextResponse.json({ error: 'no_slots_to_process', start_from_slot_index: startIdx }, { status: 400 })
  }

  // Cost guard (Q6-9)
  const estimatedCents = estimateClusterCostCents(slotsToProcess.length)
  if (estimatedCents > CLUSTER_COST_HARD_CAP_CENTS) {
    return NextResponse.json(
      {
        error: 'cluster_cost_exceeds_cap',
        estimated_cost_cents: estimatedCents,
        hard_cap_cents: CLUSTER_COST_HARD_CAP_CENTS,
      },
      { status: 422 }
    )
  }
  if (estimatedCents > CLUSTER_COST_SOFT_WARNING_CENTS && body.confirm_cost_cents !== estimatedCents) {
    return NextResponse.json(
      {
        error: 'cost_confirmation_required',
        estimated_cost_cents: estimatedCents,
        soft_warning_cents: CLUSTER_COST_SOFT_WARNING_CENTS,
        hint: `Re-fire with confirm_cost_cents: ${estimatedCents}`,
      },
      { status: 409 }
    )
  }

  // Enqueue job
  const { data: job, error: jobErr } = await sb
    .from('wv_be_jobs')
    .insert({
      client_id: cluster.client_id,
      job_type: 'cluster_generate',
      payload: {
        cluster_id: id,
        start_from_slot_index: startIdx,
        total_slots_to_process: slotsToProcess.length,
        force: body.force ?? false,
      },
      status: 'pending',
      progress: { current_slot: null, total_slots: slotsToProcess.length },
    })
    .select('id')
    .single()

  if (jobErr || !job) {
    return NextResponse.json({ error: 'job_enqueue_failed', detail: jobErr?.message }, { status: 500 })
  }

  // Flip cluster status to generating
  await sb
    .from('wv_be_clusters')
    .update({ status: 'generating', generation_started_at: new Date().toISOString() })
    .eq('id', id)

  // Reset affected slots to 'planned' (e.g. resuming from a 'failed' slot)
  await sb
    .from('wv_be_cluster_slots')
    .update({ status: 'planned', last_error: null })
    .eq('cluster_id', id)
    .gte('slot_index', startIdx)
    .in('status', ['failed', 'empty'])

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: cluster.client_id,
    actor_user_id: null,
    actor_type: 'founder',
    action: 'cluster_generation_started',
    target_table: 'wv_be_clusters',
    target_id: id,
    after_state: {
      job_id: job.id,
      start_from_slot_index: startIdx,
      slots_to_process_count: slotsToProcess.length,
      estimated_cost_cents: estimatedCents,
      re_fire: body.force ?? false,
    },
  })

  return NextResponse.json(
    {
      cluster_id: id,
      job_id: job.id,
      status: 'generating',
      estimated_cost_cents: estimatedCents,
      progress_url: `/api/be/clusters/${id}`,
      estimated_completion_ms: 30000 * slotsToProcess.length,
    },
    { status: 202 }
  )
}
