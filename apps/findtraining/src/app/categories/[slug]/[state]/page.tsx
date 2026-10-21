import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchX, MapPin, ArrowLeft } from 'lucide-react'
import { getCategoryBySlug, getCountryStats, getProvidersByCategory } from '@webvillage/engine/adapters/findtraining'
import { ProviderCard } from '@/components/ProviderCard'
import { BuyerSignup } from '@/components/BuyerSignup'
import type { Region } from '@/lib/regions'
import { getRegionBySlug, getRegions, regionsWithProviders, stateMatchForms, storedFormsForRegion } from '@/lib/regions'

// ---------------------------------------------------------------------------
// Regions (FT-GAP-6): MY states, GB nations, AU states and territories.
// Slugs are unique across countries, so /categories/[slug]/[state] needs no country segment.
// ---------------------------------------------------------------------------

const COUNTRY_INFO: Record<string, { name: string; locale: string }> = {
  MY: { name: 'Malaysia', locale: 'en_MY' },
  GB: { name: 'the UK', locale: 'en_GB' },
  AU: { name: 'Australia', locale: 'en_AU' },
}

type RegionData = {
  region: Region
  country: { name: string; locale: string }
  forms: string[]
  /** Regions of the same country with at least one provider, for cross-links. */
  activeRegions: Region[]
}

// Stored `state` values differ by import ("NSW", "New South Wales"), so the page matches every
// stored form that normalises to the region. MY keeps its old behaviour (always renders, matched
// at least by name, no country filter); a GB or AU region with no provider at all is a 404, not an
// empty page.
async function loadRegion(regionSlug: string): Promise<RegionData | null> {
  const region = getRegionBySlug(regionSlug)
  if (!region) return null
  const country = COUNTRY_INFO[region.countryCode]
  if (!country) return null
  const isMY = region.countryCode === 'MY'
  const stats = await getCountryStats(region.countryCode)
  const stored = storedFormsForRegion(region, stats.states)
  if (!isMY && stored.length === 0) return null
  return {
    region,
    country,
    forms: stateMatchForms(region, stats.states),
    activeRegions: regionsWithProviders(region.countryCode, stats.states),
  }
}

function providerFilters(data: RegionData) {
  return {
    stateIn: data.forms,
    country_code: data.region.countryCode === 'MY' ? undefined : data.region.countryCode,
  }
}

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams(): Promise<{ slug: string; state: string }[]> {
  const CATEGORY_SLUGS = [
    'it-training',
    'leadership-management',
    'finance-accounting',
    'safety-health',
    'human-resources',
    'sales-marketing',
    'customer-service',
    'soft-skills',
    'compliance-legal',
    'technical-skills',
    'hospitality-tourism',
    'healthcare',
    'manufacturing',
  ]

  // Only MY states are prebuilt, as before. GB and AU region pages render on demand, because which
  // of them exist depends on the stored `state` values at request time.
  const params: { slug: string; state: string }[] = []
  for (const slug of CATEGORY_SLUGS) {
    for (const { slug: state } of getRegions('MY')) {
      params.push({ slug, state })
    }
  }
  return params
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ slug: string; state: string }>
}

// Pages with fewer than this many real providers are noindexed to avoid
// thin-content SEO liability (FT-GAP-24). They still render for direct
// visitors — we just don't ask Google to rank them.
const MIN_INDEXABLE_PROVIDERS = 10

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, state } = await params

  const data = await loadRegion(state)
  if (!data) return { title: 'Not Found' }
  const stateName = data.region.name
  const countryName = data.country.name

  const [category, { total }] = await Promise.all([
    getCategoryBySlug(slug),
    getProvidersByCategory(slug, providerFilters(data)),
  ])
  if (!category) return { title: 'Not Found' }

  const isThin = total < MIN_INDEXABLE_PROVIDERS

  return {
    title: `${category.name} Training Providers in ${stateName}`,
    description: `Find ${category.name} training providers in ${stateName}, ${countryName}, and compare them by delivery method.`,
    alternates: {
      canonical: `https://findtraining.com/categories/${slug}/${state}`,
    },
    openGraph: {
      title: `${category.name} Training Providers in ${stateName}`,
      description: `${category.name} training providers in ${stateName}, ${countryName}.`,
      type: 'website',
      locale: data.country.locale,
      siteName: 'FindTraining',
    },
    robots: isThin ? { index: false, follow: true } : undefined,
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function CategoryStatePage({ params }: PageProps) {
  const { slug, state } = await params

  const data = await loadRegion(state)
  if (!data) notFound()
  const stateName = data.region.name
  const countryName = data.country.name
  const countryCode = data.region.countryCode

  const [category, { providers, total }] = await Promise.all([
    getCategoryBySlug(slug),
    getProvidersByCategory(slug, providerFilters(data)),
  ])

  if (!category) notFound()

  const isThinSet = total < MIN_INDEXABLE_PROVIDERS

  // JSON-LD — BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://findtraining.com' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://findtraining.com/categories' },
      { '@type': 'ListItem', position: 3, name: category.name, item: `https://findtraining.com/categories/${slug}` },
      { '@type': 'ListItem', position: 4, name: stateName },
    ],
  }

  // JSON-LD — ItemList schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Training Providers in ${stateName}`,
    description: `${category.name} training providers in ${stateName}, ${countryName}`,
    numberOfItems: total,
    itemListElement: providers.slice(0, 20).map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: p.name,
        url: `https://findtraining.com/providers/${p.slug}`,
        ...(p.state
          ? {
              address: {
                '@type': 'PostalAddress',
                addressRegion: p.state,
                addressCountry: countryCode,
              },
            }
          : {}),
      },
    })),
  }

  // Cross-links only to regions that have providers (MY falls back to its full list).
  const linkable = data.activeRegions.length > 0 || countryCode !== 'MY' ? data.activeRegions : getRegions('MY')
  const otherStateLinks = linkable.filter((r) => r.slug !== data.region.slug).slice(0, 8)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/categories" className="hover:text-gray-700 transition-colors">
                Categories
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/categories/${slug}`} className="hover:text-gray-700 transition-colors">
                {category.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium">{stateName}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#0F6FEC] mb-3">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">{stateName}, {countryName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {category.name} Training in {stateName}
          </h1>
          {category.description && (
            <p className="text-gray-600 text-base mb-3 max-w-3xl">{category.description}</p>
          )}
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{total.toLocaleString()}</span>{' '}
            {category.name.toLowerCase()} provider{total !== 1 ? 's' : ''} in{' '}
            {stateName}
          </p>
        </header>

        {/* Back links */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link
            href={`/categories/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            All {category.name} providers
          </Link>
          <span className="text-gray-300" aria-hidden="true">|</span>
          <Link
            href="/categories"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Browse all categories
          </Link>
        </div>

        {/* Thin set notice */}
        {isThinSet && providers.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Showing {total} provider{total !== 1 ? 's' : ''} in {stateName}.{' '}
            <Link href={`/categories/${slug}`} className="underline font-medium hover:text-amber-700">
              Browse all {category.name} providers
            </Link>.
          </div>
        )}

        {/* Results */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchX className="w-12 h-12 text-gray-300 mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              No {category.name.toLowerCase()} providers listed in {stateName}
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              Browse all {category.name} providers instead.
            </p>
            <Link
              href={`/categories/${slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F6FEC] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              View all {category.name} providers
            </Link>
          </div>
        )}

        {/* Buyer email capture */}
        <div className="my-10">
          <BuyerSignup
            categorySlug={slug}
            stateSlug={state}
            countryCode={countryCode}
            sourceLabel="category-state-page"
            heading={`New ${category.name} providers in ${stateName}?`}
            subheading={`We'll email you when a new ${category.name.toLowerCase()} provider lists in ${stateName}.`}
          />
        </div>

        {/* Other states cross-links */}
        <section className="border-t border-gray-100 pt-8 mt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {category.name} Training Providers by {countryCode === 'GB' ? 'Nation' : countryCode === 'AU' ? 'State or Territory' : 'State'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherStateLinks.map((r) => (
              <Link
                key={r.slug}
                href={`/categories/${slug}/${r.slug}`}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-blue-50 hover:text-[#0F6FEC] transition-colors"
              >
                {r.name}
              </Link>
            ))}
            <Link
              href={`/categories/${slug}`}
              className="px-3 py-1.5 bg-[#0F6FEC] bg-opacity-10 text-[#0F6FEC] text-xs font-medium rounded-full hover:bg-opacity-20 transition-colors"
            >
              {countryCode === 'MY' ? 'All Malaysia' : `All ${category.name}`} →
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
