// apps/web/src/lib/be-cluster-cost.ts
// Slice 6 cost constants per spec §7. Refine after ~20 cluster generations seed real data.

export const DEFAULT_PER_SLOT_ESTIMATE_CENTS = 4
export const CLUSTER_COST_SOFT_WARNING_CENTS = 50  // Q6-9 lock
export const CLUSTER_COST_HARD_CAP_CENTS = 100     // Q6-9 lock
export const CLUSTER_MAX_SLOTS = 20                // Q6-2 lock

export function estimateClusterCostCents(slotCount: number): number {
  return slotCount * DEFAULT_PER_SLOT_ESTIMATE_CENTS
}
