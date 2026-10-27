import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { COHORT_NOINDEX_ENABLED } from '@/config/indexing'
import { COHORTS_READY, indexableProviderSlugs } from '@/lib/indexing-cohorts'
import { articles } from '@/lib/resources'

const BASE_URL = 'https://findtraining.com'

// PostgREST returns at most 1000 rows per request (FT-GAP-30), so every read pages explicitly.
const PAGE = 1000
const SLUG_CHUNK = 100

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'unset',
    { auth: { persistSession: false } }
  )
}

type Db = ReturnType<typeof getServiceClient>
type ProviderRow = { slug: string; updated_at: string | null }

const NOT_REMOVED = '("removed","opted_out")'

/** Every live provider, paged past the 1000-row cap. Only used when the cohort gate is switched off. */
async function fetchAllProviders(db: Db): Promise<ProviderRow[]> {
  const all: ProviderRow[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from('ft_providers')
      .select('slug, updated_at')
      .not('profile_status', 'in', NOT_REMOVED)
      .order('slug', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`sitemap providers: ${error.message}`)
    all.push(...((data ?? []) as ProviderRow[]))
    if (!data || data.length < PAGE) break
  }
  return all
}

/** Cohort A and C providers only, looked up by slug in chunks. */
async function fetchCohortProviders(db: Db, slugs: string[]): Promise<ProviderRow[]> {
  const rows: ProviderRow[] = []
  for (let i = 0; i < slugs.length; i += SLUG_CHUNK) {
    const { data, error } = await db
      .from('ft_providers')
      .select('slug, updated_at')
      .in('slug', slugs.slice(i, i + SLUG_CHUNK))
      .not('profile_status', 'in', NOT_REMOVED)
    if (error) throw new Error(`sitemap cohort providers: ${error.message}`)
    rows.push(...((data ?? []) as ProviderRow[]))
  }
  return rows.sort((a, b) => (a.slug < b.slug ? -1 : 1))
}

/** Before the desk fills the cohort file the sitemap keeps its old shape: the 1,000 most recently updated providers. */
async function fetchLegacyProviders(db: Db): Promise<ProviderRow[]> {
  const { data, error } = await db
    .from('ft_providers')
    .select('slug, updated_at')
    .not('profile_status', 'in', NOT_REMOVED)
    .order('updated_at', { ascending: false })
    .range(0, PAGE - 1)
  if (error) throw new Error(`sitemap legacy providers: ${error.message}`)
  return (data ?? []) as ProviderRow[]
}

// lastModified is only ever a real date from the record. Pages without one omit it.
const page = (
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
  lastModified?: string | null
): MetadataRoute.Sitemap[number] => ({
  url: `${BASE_URL}${path}`,
  changeFrequency,
  priority,
  ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // No database configured (a local build without env): list the static pages only.
  // A configured database that errors still fails the build, so a broken sitemap is never published.
  const hasDb = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const db = getServiceClient()

  const providersPromise: Promise<ProviderRow[]> = !hasDb
    ? Promise.resolve([])
    : !COHORTS_READY
    ? fetchLegacyProviders(db)
    : COHORT_NOINDEX_ENABLED
      ? fetchCohortProviders(db, indexableProviderSlugs())
      : fetchAllProviders(db)

  const [providers, { data: categories }] = await Promise.all([
    providersPromise,
    hasDb
      ? db.from('ft_categories').select('slug, updated_at').eq('active', true).order('display_order', { ascending: true })
      : Promise.resolve({ data: [] as { slug: string; updated_at: string | null }[] }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    page('/', 'weekly', 1.0),
    // Hubs
    page('/providers', 'weekly', 0.8),
    page('/categories', 'weekly', 0.8),
    page('/my', 'weekly', 0.8),
    page('/au', 'weekly', 0.8),
    page('/sg', 'weekly', 0.8),
    page('/gb', 'weekly', 0.8),
    page('/us', 'weekly', 0.8),
    page('/pricing', 'monthly', 0.6),
    page('/claim-profile', 'monthly', 0.6),
    page('/privacy', 'yearly', 0.3),
    page('/terms', 'yearly', 0.3),
    // Tools
    page('/tools', 'monthly', 0.7),
    page('/tools/hrdf-calculator', 'monthly', 0.8),
    page('/tools/hrdf-eligibility', 'monthly', 0.8),
    page('/tools/uk-apprenticeship-levy-calculator', 'monthly', 0.8),
    page('/tools/skillsfuture-credit-estimator', 'monthly', 0.8),
    page('/tools/au-state-funding-lookup', 'monthly', 0.8),
    page('/tools/us-sales-training-budget', 'monthly', 0.8),
    // Guides: dated by their own published date
    page('/resources', 'weekly', 0.7),
    ...articles.map((a) => page(`/resources/${a.slug}`, 'monthly', 0.7, a.publishedAt)),
  ]

  const categoryPages: MetadataRoute.Sitemap = ((categories ?? []) as { slug: string; updated_at: string | null }[]).map(
    (c) => page(`/categories/${c.slug}`, 'monthly', 0.8, c.updated_at)
  )

  const providerPages: MetadataRoute.Sitemap = providers.map((p) =>
    page(`/providers/${p.slug}`, 'weekly', 0.7, p.updated_at)
  )

  return [...staticPages, ...categoryPages, ...providerPages]
}
