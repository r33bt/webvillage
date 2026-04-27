// apps/web/src/lib/ideogram-pricing.ts
// Cost computation for Ideogram v3 image generations.
// Source: https://about.ideogram.ai/pricing (verify periodically; update constants here)
// Returned cost_cents is rounded integer cents (USD).

import type { RenderingSpeed } from './ideogram'

// Per-image USD cost at 1024px output. As of S215 lock; verify quarterly.
const PRICING_PER_IMAGE: Record<RenderingSpeed, number> = {
  TURBO: 0.04,
  DEFAULT: 0.07,
  QUALITY: 0.09,
}

export function computeCostCents(speed: RenderingSpeed, numImages: number = 1): number {
  const usdPerImage = PRICING_PER_IMAGE[speed] ?? PRICING_PER_IMAGE.TURBO
  return Math.round(usdPerImage * numImages * 100)
}
