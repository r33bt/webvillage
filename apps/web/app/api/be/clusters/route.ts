// apps/web/app/api/be/clusters/route.ts
// Brand Engine Slice 6: POST creates a cluster + slots; returns estimated generation cost.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { CLUSTER_MAX_SLOTS, estimateClusterCostCents } from '@/lib/be-cluster-cost'

export const runtime = 'nodejs'
export const maxDuration = 30

const SlotSchema = z.object({
  slot_index: z.number().int().min(1),
  slot_topic: z.string().min(1).max(200),
  slot_brief: z.string().min(1).max(1000),
  slot_arc_role: z.enum(['setup', 'development', 'payoff', 'evergreen']).nullable().optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
  template_id: z.string().uuid().nullable().optional(),
})

const CreateClusterSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  theme: z.string().min(1).max(500),
  target_audience: z.string().min(1).max(500),
  arc_type: z.enum(['linear', 'episodic', 'evergreen']).nullable().optional(),
  cluster_template_id: z.string().uuid().nullable().optional(),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  total_slots: z.number().int().min(1).max(CLUSTER_MAX_SLOTS),
  slots: z.array(SlotSchema).min(1).max(CLUSTER_MAX_SLOTS),
})

export async function POST(req: NextRequest) {
  let body: z.infer<typeof CreateClusterSchema>
  try {
    body = CreateClusterSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // total_slots must match slots length
  if (body.slots.length !== body.total_slots) {
    return NextResponse.json(
      { error: 'total_slots_mismatch', expected: body.total_slots, got: body.slots.length },
      { status: 400 }
    )
  }

  // Slot indexes must be unique
  const indexes = new Set(body.slots.map((s) => s.slot_index))
  if (indexes.size !== body.slots.length) {
    return NextResponse.json({ error: 'duplicate_slot_index' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  // Verify client exists
  const { data: client } = await sb.from('wv_be_clients').select('id').eq('id', body.client_id).is('deleted_at', null).single()
  if (!client) {
    return NextResponse.json({ error: 'client_not_found' }, { status: 404 })
  }

  // Optional template_id sanity check
  if (body.cluster_template_id) {
    const { data: tpl } = await sb.from('wv_be_templates').select('id').eq('id', body.cluster_template_id).is('deleted_at', null).maybeSingle()
    if (!tpl) {
      return NextResponse.json({ error: 'cluster_template_not_found' }, { status: 404 })
    }
  }

  // Insert cluster
  const { data: cluster, error: clusterErr } = await sb
    .from('wv_be_clusters')
    .insert({
      client_id: body.client_id,
      name: body.name,
      theme: body.theme,
      target_audience: body.target_audience,
      arc_type: body.arc_type ?? null,
      cluster_template_id: body.cluster_template_id ?? null,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      total_slots: body.total_slots,
      status: 'planning',
    })
    .select('*')
    .single()

  if (clusterErr || !cluster) {
    return NextResponse.json({ error: 'cluster_persist_failed', detail: clusterErr?.message }, { status: 500 })
  }

  // Insert slots
  const slotInserts = body.slots.map((s) => ({
    cluster_id: cluster.id,
    slot_index: s.slot_index,
    slot_topic: s.slot_topic,
    slot_brief: s.slot_brief,
    slot_arc_role: s.slot_arc_role ?? null,
    scheduled_for: s.scheduled_for ?? null,
    template_id: s.template_id ?? null,
    status: 'planned',
  }))
  const { data: slots, error: slotsErr } = await sb.from('wv_be_cluster_slots').insert(slotInserts).select('*')
  if (slotsErr) {
    // Rollback cluster
    await sb.from('wv_be_clusters').delete().eq('id', cluster.id)
    return NextResponse.json({ error: 'slots_persist_failed', detail: slotsErr.message }, { status: 500 })
  }

  // Audit log
  await sb.from('wv_be_audit_log').insert({
    client_id: body.client_id,
    actor_user_id: null,
    actor_type: 'founder',
    action: 'cluster_created',
    target_table: 'wv_be_clusters',
    target_id: cluster.id,
    after_state: {
      name: body.name,
      theme: body.theme,
      total_slots: body.total_slots,
      slots_summary: body.slots.map((s) => ({ slot_index: s.slot_index, slot_topic: s.slot_topic })),
    },
  })

  return NextResponse.json(
    {
      cluster_id: cluster.id,
      cluster,
      slots,
      estimated_generation_cost_cents: estimateClusterCostCents(body.total_slots),
    },
    { status: 201 }
  )
}
