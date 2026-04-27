// apps/web/src/lib/ayrshare-pricing.ts
// Slice 8: Ayrshare cost-per-post (subscription/quota model, not per-call).
// VERIFY against ayrshare.com/pricing at quarterly cadence.

const PER_POST_CENTS: Record<string, number> = {
  free: 0,                                  // Ayrshare free tier — limited posts, $0 marginal
  premium: Math.round((49 * 100) / 200),   // $49/mo, ~200 posts/mo → 24.5 cents/post
  business: Math.round((149 * 100) / 1000), // $149/mo, ~1000 posts/mo → 14.9 cents/post
}

export function ayrsharePostCostCents(plan: string, platformCount: number = 1): number {
  const perPost = PER_POST_CENTS[plan.toLowerCase()] ?? 0
  return perPost * platformCount
}
