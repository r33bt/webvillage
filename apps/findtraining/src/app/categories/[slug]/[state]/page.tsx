import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchX, MapPin, ArrowLeft } from 'lucide-react'
import { getCategoryBySlug, getProvidersByCategory } from '@webvillage/engine/adapters/findtraining'
import { ProviderCard } from '@/components/ProviderCard'
import { BuyerSignup } from '@/components/BuyerSignup'
import { COUNTRY_CONFIGS } from '@/lib/countries'

// ---------------------------------------------------------------------------
// Region slug → { display name, country code, country name } map
// Built from COUNTRY_CONFIGS.regions so any country with regions gets pages.
// Region slugs must be globally unique across countries — true today
// (MY states vs GB nations vs AU states/territories don't collide).
// ---------------------------------------------------------------------------

type RegionInfo = {
  name: string
  countryCode: string
  countrySlug: string
  countryName: string
  regulatoryAcronym: string
}

const REGION_MAP: Record<string, RegionInfo> = (() => {
  const map: Record<string, RegionInfo> = {}
  for (const cfg of Object.values(COUNTRY_CONFIGS)) {
    if (!cfg.regions) continue
    for (const [slug, name] of Object.entries(cfg.regions)) {
      map[slug] = {
        name,
        countryCode: cfg.code,
        countrySlug: cfg.slug,
        countryName: cfg.name,
        regulatoryAcronym: cfg.regulatoryBody?.acronym ?? 'accredited',
      }
    }
  }
  return map
})()

// ---------------------------------------------------------------------------
// Static params — generate <category> × <region> combos for every country
// that has a regions map. GB + AU now produce pages alongside MY.
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

  const params: { slug: string; state: string }[] = []
  const regionSlugs = Object.keys(REGION_MAP)
  for (const slug of CATEGORY_SLUGS) {
    for (const state of regionSlugs) {
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

  const region = REGION_MAP[state]
  if (!region) return { title: 'Not Found' }

  const [category, { total }] = await Promise.all([
    getCategoryBySlug(slug),
    getProvidersByCategory(slug, { state: region.name, country_code: region.countryCode }),
  ])
  if (!category) return { title: 'Not Found' }

  const isThin = total < MIN_INDEXABLE_PROVIDERS
  const accreditedPrefix = region.regulatoryAcronym !== 'accredited'
    ? `${region.regulatoryAcronym}-registered`
    : 'accredited'

  return {
    title: `${category.name} Training Providers in ${region.name}`,
    description: `Find ${accreditedPrefix} ${category.name} training providers in ${region.name}, ${region.countryName}. Browse approved providers and courses.`,
    alternates: {
      canonical: `https://findtraining.com/categories/${slug}/${state}`,
    },
    openGraph: {
      title: `${category.name} Training Providers in ${region.name}`,
      description: `${accreditedPrefix} ${category.name} providers in ${region.name}, ${region.countryName}.`,
      type: 'website',
      locale: `en_${region.countryCode}`,
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

  const region = REGION_MAP[state]
  if (!region) notFound()

  const [category, { providers, total }] = await Promise.all([
    getCategoryBySlug(slug),
    getProvidersByCategory(slug, { state: region.name, country_code: region.countryCode }),
  ])

  if (!category) notFound()

  const isThinSet = total < MIN_INDEXABLE_PROVIDERS
  const accreditedLabel = region.regulatoryAcronym !== 'accredited'
    ? `${region.regulatoryAcronym}-registered`
    : 'accredited'

  // JSON-LD — BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://findtraining.com' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://findtraining.com/categories' },
      { '@type': 'ListItem', position: 3, name: category.name, item: `https://findtraining.com/categories/${slug}` },
      { '@type': 'ListItem', position: 4, name: region.name },
    ],
  }

  // JSON-LD — ItemList schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Training Providers in ${region.name}`,
    description: `${accreditedLabel} ${category.name} training providers in ${region.name}, ${region.countryName}`,
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
                addressCountry: region.countryCode,
              },
            }
          : {}),
      },
    })),
  }

  // Cross-link to sibling regions in the same country (not other countries)
  const sameCountryRegionSlugs = Object.entries(REGION_MAP)
    .filter(([s, r]) => s !== state && r.countryCode === region.countryCode)
    .map(([s]) => s)
    .slice(0, 8)

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
            <li className="text-gray-900 font-medium">{region.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#0F6FEC] mb-3">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">{region.name}, {region.countryName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {category.name} Training in {region.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 text-base mb-3 max-w-3xl">{category.description}</p>
          )}
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{total.toLocaleString()}</span>{' '}
            {accreditedLabel} {category.name.toLowerCase()} provider{total !== 1 ? 's' : ''} in{' '}
            {region.name}
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
            <span className="font-medium">Limited coverage in {region.name} for this category.</span>{' '}
            Showing {total} provider{total !== 1 ? 's' : ''}. For a fuller set,{' '}
            <Link href={`/categories/${slug}`} className="underline font-medium hover:text-amber-700">
              browse {category.name} across all of {region.countryName}
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
              No providers found in {region.name} yet
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              We don&apos;t have any {category.name.toLowerCase()} training providers listed for{' '}
              {region.name} at the moment. Try browsing all {category.name} providers across{' '}
              {region.countryName}.
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
            countryCode={region.countryCode}
            sourceLabel="category-state-page"
            heading={`New ${category.name} providers in ${region.name}?`}
            subheading={`We'll email you when a new ${category.name.toLowerCase()} provider lists in ${region.name}.`}
          />
        </div>

        {/* Sibling regions cross-links (same country only) */}
        {sameCountryRegionSlugs.length > 0 && (
          <section className="border-t border-gray-100 pt-8 mt-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {category.name} Training Providers by Region
            </h2>
            <div className="flex flex-wrap gap-2">
              {sameCountryRegionSlugs.map((s) => (
                <Link
                  key={s}
                  href={`/categories/${slug}/${s}`}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-blue-50 hover:text-[#0F6FEC] transition-colors"
                >
                  {REGION_MAP[s].name}
                </Link>
              ))}
              <Link
                href={`/${region.countrySlug}`}
                className="px-3 py-1.5 bg-[#0F6FEC] bg-opacity-10 text-[#0F6FEC] text-xs font-medium rounded-full hover:bg-opacity-20 transition-colors"
              >
                All {region.countryName} →
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
