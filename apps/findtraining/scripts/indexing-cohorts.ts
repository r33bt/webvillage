// Deterministic cohort selection for the findtraining.com indexing experiment.
//
// READ-ONLY. Reads ft_providers (GET requests only) or a JSON file of rows, and writes
//   src/data/indexing-cohorts.json   (what the app reads)
//   scripts/indexing-cohorts.csv     (slug, country, cohort, score, reason: for the desk)
//
// Cohort A: 150 strongest pages. Order by enrichment score (count of renderable verified
//           fields, see src/lib/provider-facts.ts), then slug. Quotas MY 60, AU 60, SG 30.
//           A country with fewer rows scoring >= MIN_SCORE gets fewer; nothing is padded.
// Cohort C: 60 control pages matched to A on country and first letter, picked by the lowest
//           sha256(slug). Quotas follow A's country mix (largest remainder).
// Cohort B: everything else. Not listed; the app treats "not in A or C" as B.
// One row per normalised company name is eligible, so the MY duplicate rows
// (-1..-5, -hrdcorp...) never enter A or C. This does not touch the database.
//
// Run on the desk (Node 22.18+):
//   export NEXT_PUBLIC_SUPABASE_URL=...   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
//   node --experimental-strip-types scripts/indexing-cohorts.ts --as-of 2026-10-28
// Offline: add --input rows.json (an array of ft_providers rows).

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { enrichmentScore, normalizedProviderName } from '../src/lib/provider-facts.ts'

export const A_QUOTAS: Record<string, number> = { MY: 60, AU: 60, SG: 30 }
export const C_TOTAL = 60
export const MIN_SCORE = 3

export type Row = {
  slug: string
  name: string
  country_code: string
  state: string | null
  region: string | null
  description: string | null
  website: string | null
  address: string | null
  city: string | null
  ssm_number: string | null
  registration_date: string | null
  raw_data: Record<string, unknown> | null
  hrdf_status: string | null
  profile_status: string | null
}

export type CohortOutput = {
  schemaVersion: 1
  status: 'generated'
  generatedAt: string
  note: string
  counts: { population: number; eligibleUnique: number; A: number; C: number; B: number }
  shortfalls: Record<string, string>
  A: { slug: string; country: string; state: string | null; name: string; score: number }[]
  C: { slug: string; country: string }[]
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const letterOf = (slug: string) => (/^[a-z]/.test(slug) ? slug[0] : '#')
const byScoreThenSlug = (a: { score: number; row: Row }, b: { score: number; row: Row }) =>
  b.score - a.score || (a.row.slug < b.row.slug ? -1 : a.row.slug > b.row.slug ? 1 : 0)

/** Largest-remainder split of `total` across the A country counts. */
function controlQuotas(aCounts: Record<string, number>, total: number): Record<string, number> {
  const sumA = Object.values(aCounts).reduce((a, b) => a + b, 0)
  if (sumA === 0) return {}
  const exact = Object.entries(aCounts).map(([c, n]) => [c, (n / sumA) * total] as const)
  const out: Record<string, number> = Object.fromEntries(exact.map(([c, v]) => [c, Math.floor(v)]))
  let left = total - Object.values(out).reduce((a, b) => a + b, 0)
  const order = [...exact].sort((x, y) => (y[1] % 1) - (x[1] % 1) || (x[0] < y[0] ? -1 : 1))
  for (const [c] of order) {
    if (left <= 0) break
    out[c]++
    left--
  }
  return out
}

export function selectCohorts(rows: Row[], asOf: string): { out: CohortOutput; csv: string } {
  const live = rows.filter(
    (r) => r.slug && r.name && r.profile_status !== 'removed' && r.profile_status !== 'opted_out',
  )

  // One eligible row per country + normalised name: the best-scoring one, then slug.
  const best = new Map<string, { score: number; row: Row }>()
  for (const row of live) {
    const key = `${row.country_code}|${normalizedProviderName(row.name)}`
    const cand = { score: enrichmentScore(row), row }
    const cur = best.get(key)
    if (!cur || byScoreThenSlug(cand, cur) < 0) best.set(key, cand)
  }
  const eligible = Array.from(best.values())

  // Cohort A
  const A: { score: number; row: Row }[] = []
  const shortfalls: Record<string, string> = {}
  for (const [country, quota] of Object.entries(A_QUOTAS)) {
    const pool = eligible
      .filter((e) => e.row.country_code === country && e.score >= MIN_SCORE)
      .sort(byScoreThenSlug)
    const picked = pool.slice(0, quota)
    A.push(...picked)
    if (picked.length < quota) {
      shortfalls[country] = `${picked.length} of ${quota}: only ${picked.length} rows score >= ${MIN_SCORE}`
    }
  }
  const aSlugs = new Set(A.map((e) => e.row.slug))

  // Cohort C
  const aCounts: Record<string, number> = {}
  for (const e of A) aCounts[e.row.country_code] = (aCounts[e.row.country_code] ?? 0) + 1
  const quotas = controlQuotas(aCounts, C_TOTAL)
  const C: { slug: string; country: string; reason: string }[] = []
  for (const country of Object.keys(quotas).sort()) {
    const quota = quotas[country]
    const pool = eligible
      .filter((e) => e.row.country_code === country && !aSlugs.has(e.row.slug))
      .map((e) => e.row.slug)
      .sort((a, b) => (sha(a) < sha(b) ? -1 : 1))
    const byLetter = new Map<string, string[]>()
    for (const s of pool) {
      const l = letterOf(s)
      byLetter.set(l, [...(byLetter.get(l) ?? []), s])
    }
    const used = new Set<string>()
    const aMembers = A.filter((e) => e.row.country_code === country)
      .map((e) => e.row.slug)
      .sort((a, b) => (sha(a) < sha(b) ? -1 : 1))
    for (const a of aMembers) {
      if (used.size >= quota) break
      const next = (byLetter.get(letterOf(a)) ?? []).find((s) => !used.has(s))
      if (next) {
        used.add(next)
        C.push({ slug: next, country, reason: `matched to ${a} (letter ${letterOf(a)})` })
      }
    }
    for (const s of pool) {
      if (used.size >= quota) break
      if (!used.has(s)) {
        used.add(s)
        C.push({ slug: s, country, reason: 'fill: no unused same-letter candidate' })
      }
    }
  }

  const out: CohortOutput = {
    schemaVersion: 1,
    status: 'generated',
    generatedAt: asOf,
    note: 'Written by scripts/indexing-cohorts.ts. Do not edit by hand; re-run the script.',
    counts: {
      population: live.length,
      eligibleUnique: eligible.length,
      A: A.length,
      C: C.length,
      B: live.length - A.length - C.length,
    },
    shortfalls,
    A: A.map((e) => ({
      slug: e.row.slug,
      country: e.row.country_code,
      state: e.row.state ?? e.row.region ?? null,
      name: e.row.name,
      score: e.score,
    })),
    C: C.map(({ slug, country }) => ({ slug, country })),
  }
  const csv =
    'slug,country,cohort,score,reason\n' +
    A.map((e) => `${e.row.slug},${e.row.country_code},A,${e.score},top score in ${e.row.country_code}`).join('\n') +
    '\n' +
    C.map((c) => `${c.slug},${c.country},C,,"${c.reason}"`).join('\n') +
    '\n'
  return { out, csv }
}

const SELECT =
  'slug,name,country_code,state,region,description,website,address,city,ssm_number,registration_date,raw_data,hrdf_status,profile_status'

async function fetchRows(): Promise<Row[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or pass --input rows.json). No data was read.',
    )
  }
  const rows: Row[] = []
  const page = 1000
  for (let offset = 0; ; offset += page) {
    const q = `select=${SELECT}&profile_status=not.in.(removed,opted_out)&order=slug.asc&limit=${page}&offset=${offset}`
    const res = await fetch(`${url}/rest/v1/ft_providers?${q}`, {
      method: 'GET',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!res.ok) throw new Error(`ft_providers read failed: ${res.status} ${await res.text()}`)
    const batch = (await res.json()) as Row[]
    rows.push(...batch)
    if (batch.length < page) break
  }
  return rows
}

async function main() {
  const args = process.argv.slice(2)
  const arg = (name: string) => {
    const i = args.indexOf(name)
    return i >= 0 ? args[i + 1] : undefined
  }
  const asOf = arg('--as-of') ?? new Date().toISOString().slice(0, 10)
  const here = path.dirname(fileURLToPath(import.meta.url))
  const jsonOut = arg('--out') ?? path.join(here, '../src/data/indexing-cohorts.json')
  const csvOut = arg('--csv') ?? path.join(here, 'indexing-cohorts.csv')
  const input = arg('--input')
  const rows = input ? (JSON.parse(readFileSync(input, 'utf8')) as Row[]) : await fetchRows()
  const { out, csv } = selectCohorts(rows, asOf)
  writeFileSync(jsonOut, JSON.stringify(out, null, 2) + '\n')
  writeFileSync(csvOut, csv)
  console.log(`rows read: ${rows.length}`)
  console.log(`counts: ${JSON.stringify(out.counts)}`)
  if (Object.keys(out.shortfalls).length) console.log(`shortfalls: ${JSON.stringify(out.shortfalls)}`)
  console.log(`wrote ${jsonOut}\nwrote ${csvOut}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(String(e instanceof Error ? e.message : e))
    process.exit(1)
  })
}
