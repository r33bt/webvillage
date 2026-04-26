// apps/web/src/lib/anthropic.ts
// Anthropic SDK client init. Used by Brand Engine Slice 3+ for draft gen + scoring.

import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAnthropic(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY not set. Set it in Vercel env (production+preview) or local .env.local. ' +
        'Per S215 founder lock: Anthropic is the runtime LLM provider; top up at console.anthropic.com if balance is $0.'
    )
  }
  _client = new Anthropic({ apiKey })
  return _client
}

// Model IDs per S215 lock. Update here when Anthropic releases new models.
export const MODELS = {
  generation: 'claude-sonnet-4-6',
  scoring: 'claude-haiku-4-5-20251001',
} as const
