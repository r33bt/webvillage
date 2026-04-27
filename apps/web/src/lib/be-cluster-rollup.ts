// apps/web/src/lib/be-cluster-rollup.ts
// Slice 6 score rollup per spec §5. Live-computed, no materialized view (deferred to Slice 9 Looker).

import { createSupabaseServiceClient } from './supabase'

export interface SlotRollupRow {
  slot_index: number
  slot_topic: string
  slot_brief: string
  slot_arc_role: string | null
  scheduled_for: string | null
  status: string
  draft_id: string | null
  draft_generated_at: string | null
  last_error: string | null
  // Joined from drafts + scores
  draft_status: string | null
  draft_score_average: number | null
  draft_passes_threshold: boolean | null
  draft_banned_phrase_hits: string[] | null
  draft_score_per_pillar: { provenance: number; specificity: number; structure: number; voice: number; utility: number } | null
}

export interface ClusterRollup {
  avg_score: number | null
  avg_per_pillar: {
    provenance: number | null
    specificity: number | null
    structure: number | null
    voice: number | null
    utility: number | null
  }
  slots_drafted: number
  slots_failed: number
  slots_pending: number
  total_cost_cents: number
}

export async function fetchSlotsWithRollup(clusterId: string): Promise<SlotRollupRow[]> {
  const sb = createSupabaseServiceClient()
  // Two-step: fetch slots; then for each slot with draft_id, look up scores + drafts
  const { data: slots } = await sb
    .from('wv_be_cluster_slots')
    .select('id, slot_index, slot_topic, slot_brief, slot_arc_role, scheduled_for, status, draft_id, draft_generated_at, last_error')
    .eq('cluster_id', clusterId)
    .order('slot_index', { ascending: true })

  const draftIds = (slots ?? []).map((s) => s.draft_id).filter((id): id is string => !!id)
  let scoresById = new Map<string, { scores: Record<string, number>; passes_threshold: boolean; banned_phrase_hits: string[] }>()
  let draftStatusById = new Map<string, string>()

  if (draftIds.length > 0) {
    const [{ data: scores }, { data: drafts }] = await Promise.all([
      sb.from('wv_be_scores').select('draft_id, scores, passes_threshold, banned_phrase_hits').in('draft_id', draftIds),
      sb.from('wv_be_drafts').select('id, status').in('id', draftIds),
    ])
    for (const s of scores ?? []) scoresById.set(s.draft_id as string, s as never)
    for (const d of drafts ?? []) draftStatusById.set(d.id as string, d.status as string)
  }

  return (slots ?? []).map((slot) => {
    const score = slot.draft_id ? scoresById.get(slot.draft_id as string) : null
    const draftStatus = slot.draft_id ? draftStatusById.get(slot.draft_id as string) ?? null : null
    let avg: number | null = null
    let perPillar: SlotRollupRow['draft_score_per_pillar'] = null
    if (score) {
      const s = score.scores as { provenance: number; specificity: number; structure: number; voice: number; utility: number; average?: number }
      avg = s.average ?? (s.provenance + s.specificity + s.structure + s.voice + s.utility) / 5
      perPillar = {
        provenance: s.provenance,
        specificity: s.specificity,
        structure: s.structure,
        voice: s.voice,
        utility: s.utility,
      }
    }
    return {
      slot_index: slot.slot_index as number,
      slot_topic: slot.slot_topic as string,
      slot_brief: slot.slot_brief as string,
      slot_arc_role: slot.slot_arc_role as string | null,
      scheduled_for: slot.scheduled_for as string | null,
      status: slot.status as string,
      draft_id: slot.draft_id as string | null,
      draft_generated_at: slot.draft_generated_at as string | null,
      last_error: slot.last_error as string | null,
      draft_status: draftStatus,
      draft_score_average: avg,
      draft_passes_threshold: score?.passes_threshold ?? null,
      draft_banned_phrase_hits: score?.banned_phrase_hits ?? null,
      draft_score_per_pillar: perPillar,
    }
  })
}

export async function computeClusterRollup(clusterId: string, slots: SlotRollupRow[]): Promise<ClusterRollup> {
  const drafted = slots.filter((s) => s.status === 'drafted' && s.draft_score_average !== null)
  const failed = slots.filter((s) => s.status === 'failed')
  const pending = slots.filter((s) => ['empty', 'planned', 'generating'].includes(s.status))

  // Per-pillar averages from drafted slots
  const pillarSums = { provenance: 0, specificity: 0, structure: 0, voice: 0, utility: 0 }
  for (const s of drafted) {
    if (s.draft_score_per_pillar) {
      pillarSums.provenance += s.draft_score_per_pillar.provenance
      pillarSums.specificity += s.draft_score_per_pillar.specificity
      pillarSums.structure += s.draft_score_per_pillar.structure
      pillarSums.voice += s.draft_score_per_pillar.voice
      pillarSums.utility += s.draft_score_per_pillar.utility
    }
  }
  const n = drafted.length
  const avgPerPillar = {
    provenance: n > 0 ? pillarSums.provenance / n : null,
    specificity: n > 0 ? pillarSums.specificity / n : null,
    structure: n > 0 ? pillarSums.structure / n : null,
    voice: n > 0 ? pillarSums.voice / n : null,
    utility: n > 0 ? pillarSums.utility / n : null,
  }

  const avgScore = n > 0 ? drafted.reduce((s, x) => s + (x.draft_score_average ?? 0), 0) / n : null

  // Total cost from audit log (gen + score per slot draft)
  let totalCostCents = 0
  const draftIds = drafted.map((s) => s.draft_id).filter((id): id is string => !!id)
  if (draftIds.length > 0) {
    const sb = createSupabaseServiceClient()
    const { data: audits } = await sb
      .from('wv_be_audit_log')
      .select('after_state')
      .in('target_id', draftIds)
      .in('action', ['draft_generation', 'draft_scoring'])
    for (const a of audits ?? []) {
      const cost = (a.after_state as { cost_cents?: number } | null)?.cost_cents
      if (typeof cost === 'number') totalCostCents += cost
    }
  }

  return {
    avg_score: avgScore,
    avg_per_pillar: avgPerPillar,
    slots_drafted: drafted.length,
    slots_failed: failed.length,
    slots_pending: pending.length,
    total_cost_cents: totalCostCents,
  }
}
