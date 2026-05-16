/**
 * BrandHacker Brand Health Score v0 — shared computation
 *
 * Formula: (AEO coverage % + voice consistency %) / 2 → 0–100 composite
 *
 * AEO coverage:      fresh llms_txt + brand_json out of 2 possible → 0 / 50 / 100
 * Voice consistency: avg overall pillar score (0–10) × 10 → 0–100. Zero if no scored drafts.
 * Result:            null when both components have zero data (widget shows "not enough data yet")
 *
 * Weekly score stored in wv_be_clients.metadata.health_scores[weekKey]:
 *   { score, aeo, voice, computed_at }
 */

const AEO_TYPES = ['llms_txt', 'brand_json'] as const
const FRESH_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export type AeoArtefactRow = { artefact_type: string; generated_at: string }
export type ScoreRow = { scores: Record<string, number> | null }

export type HealthScoreResult = {
  score: number
  aeoCoverage: number
  voiceConsistency: number
}

export type StoredWeekScore = {
  score: number
  aeo: number
  voice: number
  computed_at: string
}

export function computeHealthScore(
  aeoArtefacts: AeoArtefactRow[],
  recentScores: ScoreRow[],
): HealthScoreResult | null {
  const freshAeoCount = aeoArtefacts.filter(
    (a) =>
      (AEO_TYPES as readonly string[]).includes(a.artefact_type) &&
      Date.now() - new Date(a.generated_at).getTime() < FRESH_MS,
  ).length
  const aeoCoverage = Math.round((freshAeoCount / AEO_TYPES.length) * 100)

  const avgOverall =
    recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + (s.scores?.overall ?? 0), 0) / recentScores.length
      : 0
  const voiceConsistency = Math.round(avgOverall * 10)

  if (freshAeoCount === 0 && recentScores.length === 0) return null

  return { score: Math.round((aeoCoverage + voiceConsistency) / 2), aeoCoverage, voiceConsistency }
}

/** ISO week key — e.g. '2026-W20'. Uses ISO 8601 (week starts Monday). */
export function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** ISO week key for 7 days ago (previous week's cron window). */
export function getPrevWeekKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return getWeekKey(d)
}
