// Cohort membership for the indexing experiment, read from a committed JSON file.
// A = strongest pages (indexable, linked from hubs), C = control (indexable, unchanged
// otherwise), B = every other provider (noindex, out of the sitemap).
import cohortFile from '../data/indexing-cohorts.json'
import { COHORT_NOINDEX_ENABLED } from '../config/indexing'

export type Cohort = 'A' | 'B' | 'C'

export type CohortAEntry = {
  slug: string
  country: string
  state: string | null
  name: string
  score: number
}
export type CohortCEntry = { slug: string; country: string }

type CohortFile = {
  status: string
  A: CohortAEntry[]
  C: CohortCEntry[]
}

const data = cohortFile as unknown as CohortFile

const aSlugs = new Set(data.A.map((e) => e.slug))
const cSlugs = new Set(data.C.map((e) => e.slug))

/** True once the desk has written real membership. Until then nothing is gated. */
export const COHORTS_READY: boolean = data.status === 'generated' && data.A.length > 0

export function getCohort(slug: string): Cohort {
  if (aSlugs.has(slug)) return 'A'
  if (cSlugs.has(slug)) return 'C'
  return 'B'
}

/** Whether the provider page should be indexable and listed in the sitemap. */
export function isProviderIndexable(slug: string): boolean {
  if (!COHORT_NOINDEX_ENABLED || !COHORTS_READY) return true
  return getCohort(slug) !== 'B'
}

/** Slugs allowed in the sitemap when the gate is active (A then C, stable order). */
export function indexableProviderSlugs(): string[] {
  return [...data.A.map((e) => e.slug), ...data.C.map((e) => e.slug)]
}

export function cohortAForCountry(country: string): CohortAEntry[] {
  return data.A.filter((e) => e.country === country)
}

export function cohortAEntries(): CohortAEntry[] {
  return data.A
}
