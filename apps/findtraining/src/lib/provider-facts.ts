// Provider facts: the verified, renderable fields of one provider row.
//
// Pure functions, no framework imports, so the page, the sitemap and the desk
// cohort script (scripts/indexing-cohorts.ts) all count and render the same
// fields. Nothing here estimates or fills a blank: a fact exists only when the
// row holds a value for it.

import type { FtProvider } from '@webvillage/engine/types/ft'

export type ProviderFact = {
  key: string
  label: string
  value: string
  /** Optional https link attached to the value (a registry record). */
  href?: string
  /** True for registry identifiers (ABN, HRD Corp number, UEN...), repeated in JSON-LD. */
  identifier?: boolean
}

const AU_STATES: Record<string, string> = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  SA: 'South Australia',
  WA: 'Western Australia',
  TAS: 'Tasmania',
  NT: 'Northern Territory',
  ACT: 'Australian Capital Territory',
}

const COUNTRY_NAMES: Record<string, string> = {
  MY: 'Malaysia',
  AU: 'Australia',
  SG: 'Singapore',
  GB: 'United Kingdom',
  US: 'United States',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Raw category values that carry no information for a reader. */
const GENERIC_CATEGORIES = new Set(['general_training', 'general-training', 'general'])

export function countryName(code: string | null | undefined): string {
  return COUNTRY_NAMES[(code ?? '').toUpperCase()] ?? 'Malaysia'
}

/** "vocational_training" -> "Vocational training". Never leaks enum underscores. */
export function humanizeCategory(raw: string): string {
  const spaced = raw.replace(/[_-]+/g, ' ').trim().toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** First category worth showing, as words ("vocational training", "IT technology"), or null. */
export function primaryCategoryLabel(categories: string[] | null | undefined): string | null {
  const first = (categories ?? []).find((c) => c && !GENERIC_CATEGORIES.has(c.toLowerCase()))
  if (!first) return null
  return humanizeCategory(first)
    .toLowerCase()
    .replace(/\b(it|hr)\b/g, (m) => m.toUpperCase())
}

/** "a vocational training provider", "an IT technology training provider", "a training provider". */
export function providerKindPhrase(categories: string[] | null | undefined): string {
  const cat = primaryCategoryLabel(categories)
  const noun = !cat ? 'training provider' : /training$/.test(cat) ? `${cat} provider` : `${cat} training provider`
  return `${/^([aeiou]|IT\b|HR\b)/.test(noun) ? 'an' : 'a'} ${noun}`
}

/** Full state name for display (AU stores abbreviations). */
export function stateLabel(country: string, state: string | null | undefined): string | null {
  if (!state) return null
  if (country === 'AU') return AU_STATES[state.toUpperCase()] ?? state
  return state
}

function str(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t : null
}

function httpsUrl(v: unknown): string | null {
  const s = str(v)
  return s && /^https:\/\//i.test(s) ? s : null
}

/** Parses ISO (2021-11-27) or dd/mm/yyyy; returns "27 Nov 2021", or null when unparseable. */
export function formatRegistryDate(v: unknown): string | null {
  const s = str(v)
  if (!s) return null
  let y: number, m: number, d: number
  let match = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    y = +match[1]; m = +match[2]; d = +match[3]
  } else {
    match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (!match) return null
    d = +match[1]; m = +match[2]; y = +match[3]
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  return `${d} ${MONTHS[m - 1]} ${y}`
}

function rawObj(p: Pick<FtProvider, 'raw_data'>): Record<string, unknown> {
  const r = p.raw_data
  return r && typeof r === 'object' && !Array.isArray(r) ? (r as Record<string, unknown>) : {}
}

type FactSource = Pick<
  FtProvider,
  'country_code' | 'state' | 'region' | 'address' | 'city' | 'ssm_number' | 'registration_date' | 'raw_data'
> & { hrdf_status: string | null }

/**
 * Verified facts held for this provider, in display order.
 * Contact details (email, phone) are not facts here: the page gates them behind a claim.
 */
export function buildProviderFacts(p: FactSource): ProviderFact[] {
  const raw = rawObj(p)
  const country = (p.country_code ?? '').toUpperCase()
  const facts: ProviderFact[] = []
  const add = (key: string, label: string, value: string | null, href?: string | null, identifier = false) => {
    if (value) facts.push({ key, label, value, ...(href ? { href } : {}), ...(identifier ? { identifier } : {}) })
  }
  const sourceUrl = httpsUrl(raw.source_url)

  if (country === 'AU') {
    add('au-status', 'Registration status', str(raw.status))
    add('au-regulator', 'Regulator', str(raw.regulatory_body))
    add('au-rto-type', 'RTO type', str(raw.rto_type))
    add('au-org-code', 'Organisation code', str(raw.organisation_code), null, true)
    add('au-abn', 'ABN', str(raw.abn), null, true)
    add('au-reg-start', 'Registered from', formatRegistryDate(raw.registration_start))
    add('au-reg-end', 'Registration ends', formatRegistryDate(raw.registration_end))
    add('au-business-names', 'Business names', str(raw.business_names))
    add('au-source', 'Source', sourceUrl ? 'training.gov.au national register' : null, sourceUrl)
  } else if (country === 'MY') {
    add(
      'my-hrdc-status',
      'HRD Corp status',
      p.hrdf_status === 'registered' ? 'Registered training provider' : null,
    )
    add('my-hrdc-no', 'HRD Corp registration no.', str(raw.registration_no), null, true)
    add('my-ssm', 'Company number (SSM)', str(p.ssm_number), null, true)
    add('my-reg-date', 'Registered since', formatRegistryDate(p.registration_date))
    add('my-specialisation', 'Specialisation', str(raw.specialisation))
    add('my-source', 'Source', sourceUrl ? 'HRD Corp eTRIS register' : null, sourceUrl)
  } else if (country === 'SG') {
    const extra = raw.extra && typeof raw.extra === 'object' ? (raw.extra as Record<string, unknown>) : {}
    add('sg-uen', 'UEN', str(extra.uen), null, true)
    add('sg-source', 'Source', sourceUrl ? 'SkillsFuture Singapore listing' : null, sourceUrl)
  }

  // Location: one fact built from what is present.
  const stateName = stateLabel(country, str(p.state))
  const regionName = str(p.region)
  const place = [str(p.address), str(p.city), stateName ?? regionName, stateName ? regionName : null]
    .filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i)
  if (place.length > 0) add('location', 'Location', place.join(', '))

  return facts
}

type ScoreSource = FactSource & Pick<FtProvider, 'description' | 'website'>

/**
 * Enrichment score for cohort selection: the number of renderable verified
 * fields. The facts above, plus a written description and a website, which the
 * page also renders.
 */
export function enrichmentScore(p: ScoreSource): number {
  return buildProviderFacts(p).length + (str(p.description) ? 1 : 0) + (str(p.website) ? 1 : 0)
}

/** Normalised company name used to collapse duplicate rows when choosing cohorts. */
export function normalizedProviderName(name: string): string {
  let n = name.toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').replace(/\s+/g, ' ').trim()
  const suffix = /\b(sdn bhd|sdn|bhd|berhad|pty ltd|pty limited|pty|ltd|limited|pte ltd|pte|llp|plt|inc|co|company|as the trustee for)\b\s*$/
  let prev = ''
  while (prev !== n) {
    prev = n
    n = n.replace(suffix, '').trim()
  }
  return n
}

/**
 * At most `limit` rows, one per company, never the page's own company. Duplicate rows of
 * one company carry different ids, so an id check alone repeats names.
 */
export function uniqueByCompany<T extends { name: string }>(ownName: string, rows: readonly T[], limit: number): T[] {
  const seen = new Set([normalizedProviderName(ownName)])
  const out: T[] = []
  for (const row of rows) {
    const key = normalizedProviderName(row.name)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
    if (out.length === limit) break
  }
  return out
}

/**
 * One sentence built only from verified facts, for pages with no written description.
 * Returns null when the row does not support a sentence (nothing is guessed).
 */
export function buildProviderSummary(p: FactSource, name: string): string | null {
  const raw = rawObj(p)
  const country = (p.country_code ?? '').toUpperCase()
  const state = stateLabel(country, str(p.state))
  if (country === 'AU') {
    if (str(raw.status) !== 'Current') return null
    const from = formatRegistryDate(raw.registration_start)
    const to = formatRegistryDate(raw.registration_end)
    return (
      `${name} is a registered training organisation${state ? ` in ${state}` : ''}, Australia` +
      `${from ? `, registered from ${from}` : ''}${to ? `${from ? ' until' : ', registered until'} ${to}` : ''}.`
    )
  }
  if (country === 'MY') {
    if (p.hrdf_status !== 'registered') return null
    return `${name} is an HRD Corp registered training provider${state ? ` in ${state}` : ''}, Malaysia.`
  }
  if (country === 'SG') {
    const extra = raw.extra && typeof raw.extra === 'object' ? (raw.extra as Record<string, unknown>) : {}
    if (!str(extra.uen) || !httpsUrl(raw.source_url)) return null
    return `${name} is a training provider listed with SkillsFuture Singapore${str(p.region) ? ` in the ${str(p.region)} region` : ''}.`
  }
  return null
}
