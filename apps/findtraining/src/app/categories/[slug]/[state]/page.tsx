import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchX, MapPin, ArrowLeft } from 'lucide-react'
import { getCategoryBySlug, getProvidersByCategory } from '@webvillage/engine/adapters/supabase'
import { ProviderCard } from '@/components/ProviderCard'

// ---------------------------------------------------------------------------
// State slug ↔ display name map
// ---------------------------------------------------------------------------

const STATE_MAP: Record<string, string> = {
  johor: 'Johor',
  kedah: 'Kedah',
  kelantan: 'Kelantan',
  'kuala-lumpur': 'Kuala Lumpur',
  labuan: 'Labuan',
  melaka: 'Melaka',
  'negeri-sembilan': 'Negeri Sembilan',
  pahang: 'Pahang',
  penang: 'Penang',
  perak: 'Perak',
  perlis: 'Perlis',
  putrajaya: 'Putrajaya',
  sabah: 'Sabah',
  sarawak: 'Sarawak',
  selangor: 'Selangor',
  terengganu: 'Terengganu',
}

const ALL_STATE_SLUGS = Object.keys(STATE_MAP)

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

  const params: { slug: string; state: string }[] = []
  for (const slug of CATEGORY_SLUGS) {
    for (const state of ALL_STATE_SLUGS) {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, state } = await params

  const stateName = STATE_MAP[state]
  if (!stateName) return { title: 'Not Found' }

  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Not Found' }

  return {
    title: `${category.name} Training Providers in ${stateName}`,
    description: `Find HRDF-registered ${category.name} training providers in ${stateName}, Malaysia. Browse approved providers offering levy-claimable courses.`,
    alternates: {
      canonical: `https://findtraining.com/categories/${slug}/${state}`,
    },
    openGraph: {
      title: `${category.name} Training Providers in ${stateName}`,
      description: `HRDF-registered ${category.name} providers in ${stateName}, Malaysia.`,
      type: 'website',
      locale: 'en_MY',
      siteName: 'FindTraining',
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function CategoryStatePage({ params }: PageProps) {
  const { slug, state } = await params

  const stateName = STATE_MAP[state]
  if (!stateName) notFound()

  const [category, { providers, total }] = await Promise.all([
    getCategoryBySlug(slug),
    getProvidersByCategory(slug, { state: stateName }),
  ])

  if (!category) notFound()

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
    description: `HRDF-registered ${category.name} training providers in ${stateName}, Malaysia`,
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
                addressCountry: 'MY',
              },
            }
          : {}),
      },
    })),
  }

  const otherStateLinks = ALL_STATE_SLUGS.filter((s) => s !== state).slice(0, 8)

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
            <span className="font-medium">{stateName}, Malaysia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {category.name} Training in {stateName}
          </h1>
          {category.description && (
            <p className="text-gray-600 text-base mb-3 max-w-3xl">{category.description}</p>
          )}
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{total.toLocaleString()}</span>{' '}
            HRDF-registered {category.name.toLowerCase()} provider{total !== 1 ? 's' : ''} in{' '}
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
              No providers found in {stateName} yet
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              We don&apos;t have any {category.name.toLowerCase()} training providers listed for{' '}
              {stateName} at the moment. Try browsing all {category.name} providers across Malaysia.
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

        {/* Other states cross-links */}
        <section className="border-t border-gray-100 pt-8 mt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {category.name} Training Providers by State
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherStateLinks.map((s) => (
              <Link
                key={s}
                href={`/categories/${slug}/${s}`}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-blue-50 hover:text-[#0F6FEC] transition-colors"
              >
                {STATE_MAP[s]}
              </Link>
            ))}
            <Link
              href={`/categories/${slug}`}
              className="px-3 py-1.5 bg-[#0F6FEC] bg-opacity-10 text-[#0F6FEC] text-xs font-medium rounded-full hover:bg-opacity-20 transition-colors"
            >
              All Malaysia →
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
