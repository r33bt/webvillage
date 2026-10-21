// FT-GAP-6: sub-national regions (MY states, GB nations, AU states and territories).
//
// `ft_providers.state` is free text from several imports, so the same region can be stored as
// "New South Wales", "NSW", "nsw " or "N.S.W.". Every lookup goes through normaliseStateKey() and a
// per-country alias map, so region pages, the country hub and /search agree on which providers
// belong to a region. The expected stored forms are listed in docs/region-state-values.md.

export type Region = {
  /** URL slug for /categories/[slug]/[state]. Unique across all countries. */
  slug: string
  name: string
  countryCode: string
  /** Other stored spellings and abbreviations (case and punctuation do not matter). */
  aliases: string[]
}

type RegionDef = Omit<Region, 'countryCode'>

const REGION_DEFS: Record<string, RegionDef[]> = {
  MY: [
    { slug: 'johor', name: 'Johor', aliases: ['Johore', 'JHR', 'Johor Darul Takzim', "Johor Darul Ta'zim"] },
    { slug: 'kedah', name: 'Kedah', aliases: ['KDH', 'Kedah Darul Aman'] },
    { slug: 'kelantan', name: 'Kelantan', aliases: ['KTN', 'Kelantan Darul Naim'] },
    {
      slug: 'kuala-lumpur',
      name: 'Kuala Lumpur',
      aliases: [
        'KL',
        'WP Kuala Lumpur',
        'W.P. Kuala Lumpur',
        'Wilayah Persekutuan Kuala Lumpur',
        'Federal Territory of Kuala Lumpur',
        'FT Kuala Lumpur',
      ],
    },
    { slug: 'labuan', name: 'Labuan', aliases: ['WP Labuan', 'W.P. Labuan', 'Wilayah Persekutuan Labuan', 'Federal Territory of Labuan'] },
    { slug: 'melaka', name: 'Melaka', aliases: ['Malacca', 'MLK'] },
    { slug: 'negeri-sembilan', name: 'Negeri Sembilan', aliases: ['Negri Sembilan', 'N Sembilan', 'NSN'] },
    { slug: 'pahang', name: 'Pahang', aliases: ['PHG', 'Pahang Darul Makmur'] },
    { slug: 'penang', name: 'Penang', aliases: ['Pulau Pinang', 'P Pinang', 'PNG'] },
    { slug: 'perak', name: 'Perak', aliases: ['PRK', 'Perak Darul Ridzuan'] },
    { slug: 'perlis', name: 'Perlis', aliases: ['PLS'] },
    { slug: 'putrajaya', name: 'Putrajaya', aliases: ['WP Putrajaya', 'W.P. Putrajaya', 'Wilayah Persekutuan Putrajaya', 'Federal Territory of Putrajaya'] },
    { slug: 'sabah', name: 'Sabah', aliases: ['SBH'] },
    { slug: 'sarawak', name: 'Sarawak', aliases: ['SWK'] },
    { slug: 'selangor', name: 'Selangor', aliases: ['SGR', 'Selangor Darul Ehsan'] },
    { slug: 'terengganu', name: 'Terengganu', aliases: ['Trengganu', 'TRG', 'Terengganu Darul Iman'] },
  ],
  GB: [
    { slug: 'england', name: 'England', aliases: ['ENG'] },
    { slug: 'scotland', name: 'Scotland', aliases: ['SCT', 'Scot'] },
    { slug: 'wales', name: 'Wales', aliases: ['WLS', 'Cymru'] },
    { slug: 'northern-ireland', name: 'Northern Ireland', aliases: ['NI', 'NIR', 'N Ireland', 'N. Ireland'] },
  ],
  AU: [
    { slug: 'new-south-wales', name: 'New South Wales', aliases: ['NSW'] },
    { slug: 'victoria', name: 'Victoria', aliases: ['VIC'] },
    { slug: 'queensland', name: 'Queensland', aliases: ['QLD'] },
    { slug: 'western-australia', name: 'Western Australia', aliases: ['WA'] },
    { slug: 'south-australia', name: 'South Australia', aliases: ['SA'] },
    { slug: 'tasmania', name: 'Tasmania', aliases: ['TAS'] },
    { slug: 'australian-capital-territory', name: 'Australian Capital Territory', aliases: ['ACT'] },
    { slug: 'northern-territory', name: 'Northern Territory', aliases: ['NT'] },
  ],
}

/** Section heading and noun per country, for the hub and region pages. */
export const REGION_LABELS: Record<string, { browse: string; plural: string }> = {
  MY: { browse: 'Browse by State', plural: 'states' },
  GB: { browse: 'Browse by Nation', plural: 'nations' },
  AU: { browse: 'Browse by State or Territory', plural: 'states and territories' },
}

const REGIONS: Record<string, Region[]> = Object.fromEntries(
  Object.entries(REGION_DEFS).map(([countryCode, defs]) => [
    countryCode,
    defs.map((d) => ({ ...d, countryCode })),
  ]),
)

const BY_SLUG: Map<string, Region> = new Map(
  Object.values(REGIONS).flat().map((r) => [r.slug, r]),
)

// Trailing country words that some imports append ("NSW, Australia", "England UK").
const COUNTRY_SUFFIXES = ['australia', 'aus', 'united kingdom', 'uk', 'great britain', 'gb', 'malaysia', 'my']

/**
 * Lower case, accents and punctuation removed, "&" read as "and", whitespace collapsed.
 * "N.S.W." → "nsw", "  Pulau  Pinang " → "pulau pinang".
 */
export function normaliseStateKey(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[.'’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * The normalised key, then the same key with a trailing postcode or country word removed
 * ("NSW 2000, Australia" → "nsw 2000 australia", "nsw 2000", "nsw"). The full key is tried first so
 * "Western Australia" is never read as "Western".
 */
function candidateKeys(raw: string | null | undefined): string[] {
  let s = normaliseStateKey(raw)
  const keys: string[] = []
  while (s) {
    keys.push(s)
    const noDigits = s.replace(/\s+\d+$/, '')
    if (noDigits !== s) {
      s = noDigits
      continue
    }
    const suffix = COUNTRY_SUFFIXES.find((w) => s.endsWith(` ${w}`))
    if (!suffix) break
    s = s.slice(0, -suffix.length - 1).trim()
  }
  return keys
}

const KEY_INDEX: Record<string, Map<string, Region>> = Object.fromEntries(
  Object.entries(REGIONS).map(([countryCode, regions]) => {
    const index = new Map<string, Region>()
    for (const r of regions) {
      for (const form of [r.name, r.slug, ...r.aliases]) index.set(normaliseStateKey(form), r)
    }
    return [countryCode, index]
  }),
)

export function getRegions(countryCode: string): Region[] {
  return REGIONS[countryCode.toUpperCase()] ?? []
}

export function getRegionBySlug(slug: string): Region | undefined {
  return BY_SLUG.get(slug.toLowerCase())
}

/** The region a stored `state` value belongs to, or undefined when it does not match one. */
export function regionForState(countryCode: string, raw: string | null | undefined): Region | undefined {
  const index = KEY_INDEX[countryCode.toUpperCase()]
  if (!index) return undefined
  for (const key of candidateKeys(raw)) {
    const region = index.get(key)
    if (region) return region
  }
  return undefined
}

/** Regions with at least one stored `state` value, in the configured order. */
export function regionsWithProviders(countryCode: string, rawStates: readonly string[]): Region[] {
  const present = new Set<string>()
  for (const raw of rawStates) {
    const r = regionForState(countryCode, raw)
    if (r) present.add(r.slug)
  }
  return getRegions(countryCode).filter((r) => present.has(r.slug))
}

/** Stored values (from the DB) that belong to this region. */
export function storedFormsForRegion(region: Region, rawStates: readonly string[]): string[] {
  return rawStates.filter((raw) => regionForState(region.countryCode, raw)?.slug === region.slug)
}

/**
 * Values to match `state` against, case-insensitively, for a region: its name, its aliases and any
 * stored values that normalise to it. Values with LIKE or filter-syntax characters are left out
 * (none of the configured forms have them).
 */
export function stateMatchForms(region: Region, rawStates: readonly string[] = []): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const form of [region.name, ...region.aliases, ...storedFormsForRegion(region, rawStates)]) {
    const v = form.trim()
    if (!v || /[%_*"\\]/.test(v)) continue
    const k = v.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(v)
  }
  return out
}
