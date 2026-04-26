// apps/web/src/lib/be-banned-phrase-enforcer.ts
// Per-phrase severity enforcement (S215 Sweep 2 lock).
// Substring matching, case-insensitive. Word-boundary regex deferred (Slice 4 follow-up).

interface BannedPhrase {
  phrase: string
  category: string | null
  severity: 'block' | 'flag'
}

export interface BannedHit {
  phrase: string
  category: string | null
  severity: 'block' | 'flag'
}

export interface EnforcerResult {
  hits: BannedHit[]
  blockHits: BannedHit[]
  flagHits: BannedHit[]
  hasHardFail: boolean
  voiceScoreDeduction: number  // -2 per flag hit, max -10
}

export function enforceBannedPhrases(draftBody: string, allBannedRows: BannedPhrase[]): EnforcerResult {
  const lower = draftBody.toLowerCase()
  const hits: BannedHit[] = []

  for (const row of allBannedRows) {
    if (lower.includes(row.phrase.toLowerCase())) {
      hits.push({ phrase: row.phrase, category: row.category, severity: row.severity })
    }
  }

  const blockHits = hits.filter((h) => h.severity === 'block')
  const flagHits = hits.filter((h) => h.severity === 'flag')
  const voiceScoreDeduction = Math.max(-10, flagHits.length * -2)

  return {
    hits,
    blockHits,
    flagHits,
    hasHardFail: blockHits.length > 0,
    voiceScoreDeduction,
  }
}
