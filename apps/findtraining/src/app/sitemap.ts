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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getServiceClient()

  const [{ data: providers }, { data: categories }] = await Promise.all([
    supabase
      .from('ft_providers')
      .select('slug, updated_at')
      .not('profile_status', 'in', '("removed","opted_out")')
      .order('updated_at', { ascending: false }),
    supabase
      .from('ft_categories')
      .select('slug, updated_at')
      .eq('active', true)
      .order('display_order', { ascending: true }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0, lastModified: new Date() },
    { url: `${BASE_URL}/categories`, changeFrequency: 'weekly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3, lastModified: new Date() },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3, lastModified: new Date() },
    { url: `${BASE_URL}/tools`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/tools/hrdf-calculator`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/tools/hrdf-eligibility`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources`, changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/resources/what-is-hrd-corp-levy`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources/how-to-find-hrdf-training-provider`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/resources/best-it-training-providers-malaysia-2026`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
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
