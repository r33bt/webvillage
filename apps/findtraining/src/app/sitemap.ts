import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { fetchAllPages } from '@/lib/fetch-all-pages'

const BASE_URL = 'https://findtraining.com'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getServiceClient()

  // FT-GAP-30: paged, or the sitemap stops at the first 1,000 providers. `id` breaks updated_at ties
  // so pages do not overlap or skip rows.
  const [providers, { data: categories }] = await Promise.all([
    fetchAllPages<{ slug: string; updated_at: string | null }>((from, to) =>
      supabase
        .from('ft_providers')
        .select('slug, updated_at')
        .not('profile_status', 'in', '("removed","opted_out")')
        .order('updated_at', { ascending: false })
        .order('id', { ascending: true })
        .range(from, to),
    ).catch((err: unknown) => {
      // Same as before paging: on a query error the sitemap still renders, without provider URLs.
      console.error('sitemap providers:', err instanceof Error ? err.message : err)
      return [] as Array<{ slug: string; updated_at: string | null }>
    }),
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

  const providerPages: MetadataRoute.Sitemap = providers.map((p) => ({
    url: `${BASE_URL}/providers/${p.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }))

  return [...staticPages, ...categoryPages, ...providerPages]
}
