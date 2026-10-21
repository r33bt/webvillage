// Descriptions on unclaimed listings were seeded by the directory, not written by the provider.
// Scheme claims ("claimable under SBL/SBL-Khas") in that text are not ours to make, so drop those sentences.
const SCHEME_CLAIM = /\b(claimable|SBL|SBL-Khas|levy[- ]claim)/i

export function publicDescription(description: string | null | undefined, claimed: boolean): string | null {
  if (!description) return null
  if (claimed) return description
  const kept = description
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !SCHEME_CLAIM.test(sentence))
    .join(' ')
    .trim()
  return kept.length > 0 ? kept : null
}
