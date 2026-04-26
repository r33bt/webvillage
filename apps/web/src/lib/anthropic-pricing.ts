// apps/web/src/lib/anthropic-pricing.ts
// Cost computation for Anthropic API calls. Source: https://docs.anthropic.com/en/docs/about-claude/pricing
// Update these constants when Anthropic changes pricing.
// Returned cost_cents is rounded integer cents (USD).

interface ModelPricing {
  input_per_million_usd: number
  output_per_million_usd: number
}

const PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-6': { input_per_million_usd: 3.0, output_per_million_usd: 15.0 },
  'claude-haiku-4-5-20251001': { input_per_million_usd: 1.0, output_per_million_usd: 5.0 },
}

export function computeCostCents(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[model]
  if (!p) {
    // Unknown model — log + return 0 to avoid blocking the audit row write
    console.warn(`[anthropic-pricing] unknown model "${model}", returning 0 cost_cents`)
    return 0
  }
  const inputUsd = (tokensIn / 1_000_000) * p.input_per_million_usd
  const outputUsd = (tokensOut / 1_000_000) * p.output_per_million_usd
  return Math.round((inputUsd + outputUsd) * 100)
}
