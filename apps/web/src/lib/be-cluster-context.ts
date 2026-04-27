// apps/web/src/lib/be-cluster-context.ts
// Slice 6 cluster context vars assembly per spec §2 (Q6-1 lock — sequential, peer titles only).

interface SlotForContext {
  slot_index: number
  slot_topic: string
  slot_brief: string
  slot_arc_role: string | null
}

interface ClusterForContext {
  id: string
  name: string
  theme: string
  target_audience: string
  arc_type: string | null
  total_slots: number
}

export interface ClusterContextVars {
  cluster_id: string
  cluster_name: string
  cluster_theme: string
  cluster_target_audience: string
  cluster_arc_type: string
  cluster_slot_index: string
  cluster_total_slots: string
  cluster_slot_arc_role: string
  cluster_peer_titles: string  // newline-joined
  cluster_slot_brief: string
  cluster_context: string  // pre-rendered block for {cluster_context} template placeholder
}

export function buildClusterContextVars(
  cluster: ClusterForContext,
  currentSlot: SlotForContext,
  allSlots: SlotForContext[]
): ClusterContextVars {
  // Order all slots by slot_index, mark current with "(this slot)"
  const peerTitles = [...allSlots]
    .sort((a, b) => a.slot_index - b.slot_index)
    .map((s) => `${s.slot_index}. ${s.slot_topic}${s.slot_index === currentSlot.slot_index ? ' (this slot)' : ''}`)
    .join('\n')

  const arcType = cluster.arc_type ?? 'free-form'
  const arcRole = currentSlot.slot_arc_role ?? ''

  const arcRoleLine = arcRole
    ? `Slot role within the arc: ${arcRole}. Treat this slot as the ${arcRole} beat — open/develop/resolve accordingly.\n`
    : ''

  const clusterContext = `This draft is part of a topic cluster.

Cluster: "${cluster.name}"
Theme: ${cluster.theme}
Audience: ${cluster.target_audience}
Arc type: ${arcType}
This is slot ${currentSlot.slot_index} of ${cluster.total_slots}.
${arcRoleLine}
Sibling slot titles (DO NOT repeat their angles):
${peerTitles}

This slot's brief: ${currentSlot.slot_brief}`

  return {
    cluster_id: cluster.id,
    cluster_name: cluster.name,
    cluster_theme: cluster.theme,
    cluster_target_audience: cluster.target_audience,
    cluster_arc_type: arcType,
    cluster_slot_index: String(currentSlot.slot_index),
    cluster_total_slots: String(cluster.total_slots),
    cluster_slot_arc_role: arcRole,
    cluster_peer_titles: peerTitles,
    cluster_slot_brief: currentSlot.slot_brief,
    cluster_context: clusterContext,
  }
}
