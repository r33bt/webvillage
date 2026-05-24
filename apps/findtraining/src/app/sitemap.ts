import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://findtraining.com'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

// PostgREST caps a single SELECT at 1000 rows; without paging the sitemap
// silently dropped 96% of providers once ft_providers exceeded 1k (FT-GAP-30).
async function fetchAllProviders(
  supabase: ReturnType<typeof getServiceClient>,
): Promise<Array<{ slug: string; updated_at: string | null }>> {
  const PAGE_SIZE = 1000
  const all: Array<{ slug: string; updated_at: string | null }> = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('ft_providers')
      .select('slug, updated_at')
      .not('profile_status', 'in', '("removed","opted_out")')
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`sitemap fetchAllProviders: ${error.message}`)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return all
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getServiceClient()

  const [providers, { data: categories }] = await Promise.all([
    fetchAllProviders(supabase),
    supabase
      .from('ft_categories')
      .select('slug, updated_at')
      .eq('active', true)
      .order('display_order', { ascending: true }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0, lastModified: new Date() },
    { url: `${BASE_URL}/categories`, changeFrequency: 'weekly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.6, lastModified: new Date() },
    { url: `${BASE_URL}/claim-profile`, changeFrequency: 'monthly', priority: 0.6, lastModified: new Date() },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3, lastModified: new Date() },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3, lastModified: new Date() },
    { url: `${BASE_URL}/tools`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/tools/hrdf-calculator`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/tools/hrdf-eligibility`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/tools/uk-apprenticeship-levy-calculator`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/tools/skillsfuture-credit-estimator`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/tools/au-state-funding-lookup`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/tools/us-sales-training-budget`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources`, changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/resources/what-is-hrd-corp-levy`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources/how-to-find-hrdf-training-provider`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources/best-it-training-providers-malaysia-2026`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/resources/uk-apprenticeship-levy-guide`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/resources/skillsfuture-credit-employer-guide-singapore`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/resources/australia-rto-buyers-guide`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/resources/how-to-choose-training-provider-malaysia`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources/corporate-training-cost-malaysia-2026`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources/sales-vs-leadership-training-when-to-spend`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources/measure-training-roi-metrics-hr-managers`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
  ]

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
  }))

  const providerPages: MetadataRoute.Sitemap = (providers ?? []).map((p) => ({
    url: `${BASE_URL}/providers/${p.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }))

  return [...staticPages, ...categoryPages, ...providerPages]
}
