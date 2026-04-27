// apps/web/src/lib/inbox-sentiment.ts
// Slice 7: keyword-based sentiment heuristic (spec §5.4). No LLM call — cheap.
// Per Q7-3 lock: result is passed as CONTEXT to the reply prompt, NOT used to switch tone register.

export type SentimentHint = 'hostile' | 'critical' | 'praising' | 'curious' | 'neutral'

const HOSTILE_RX = /\b(scam|fake|liar|misleading|fraud|cheat|garbage|trash|terrible|worst|hate)\b/i
const CRITICAL_RX = /\b(disagree|wrong|incorrect|but actually|not true|missing|missed)\b/i
const PRAISING_RX = /\b(love|amazing|great|excellent|brilliant|spot on)\b|💯|🔥/i

export function detectSentiment(text: string | null | undefined): SentimentHint {
  if (!text) return 'neutral'
  const t = text.toLowerCase()

  if (HOSTILE_RX.test(t)) return 'hostile'
  if (CRITICAL_RX.test(t)) return 'critical'
  if (PRAISING_RX.test(t) || (text.match(/!/g) ?? []).length >= 3) return 'praising'
  if (t.includes('?')) return 'curious'
  return 'neutral'
}
