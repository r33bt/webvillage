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

/** First category worth showing, as lower-case words ("vocational training"), or null. */
export function primaryCategoryLabel(categories: string[] | null | undefined): string | null {
  const first = (categories ?? []).find((c) => c && !GENERIC_CATEGORIES.has(c.toLowerCase()))
  return first ? humanizeCategory(first).toLowerCase() : null
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
  const add = (key: string, label: string, value: string | null, href?: string | null) => {
    if (value) facts.push({ key, label, value, ...(href ? { href } : {}) })
  }
  const sourceUrl = httpsUrl(raw.source_url)

  if (country === 'AU') {
    add('au-status', 'Registration status', str(raw.status))
    add('au-regulator', 'Regulator', str(raw.regulatory_body))
    add('au-rto-type', 'RTO type', str(raw.rto_type))
    add('au-org-code', 'Organisation code', str(raw.organisation_code))
    add('au-abn', 'ABN', str(raw.abn))
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
    add('my-hrdc-no', 'HRD Corp registration no.', str(raw.registration_no))
    add('my-ssm', 'Company number (SSM)', str(p.ssm_number))
    add('my-reg-date', 'Registered since', formatRegistryDate(p.registration_date))
    add('my-specialisation', 'Specialisation', str(raw.specialisation))
    add('my-source', 'Source', sourceUrl ? 'HRD Corp eTRIS register' : null, sourceUrl)
  } else if (country === 'SG') {
    const extra = raw.extra && typeof raw.extra === 'object' ? (raw.extra as Record<string, unknown>) : {}
    add('sg-uen', 'UEN', str(extra.uen))
    add('sg-source', 'Source', sourceUrl ? 'SkillsFuture Singapore listing' : null, sourceUrl)
  }

  // Location: one fact built from what is present.
  const place = [str(p.address), str(p.city), stateLabel(country, str(p.state) ?? str(p.region))]
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
