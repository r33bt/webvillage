import Link from 'next/link'
import type { Metadata } from 'next'
import { searchProviders, getDistinctCountries } from '@webvillage/engine/adapters/findtraining'
import type { FtProviderWithCategories } from '@webvillage/engine/types/ft'

// Strip Firecrawl markdown formatting from names: **Name**\\\nDescription → Name
function cleanName(name: string): string {
  const m = name.match(/^\*\*(.*?)\*\*/)
  return m ? m[1].trim() : name
}

const COUNTRY_OPTIONS: Record<string, { label: string; flag: string }> = {
  MY: { label: 'Malaysia', flag: '🇲🇾' },
  SG: { label: 'Singapore', flag: '🇸🇬' },
  GB: { label: 'United Kingdom', flag: '🇬🇧' },
  AU: { label: 'Australia', flag: '🇦🇺' },
  US: { label: 'United States', flag: '🇺🇸' },
  ZZ: { label: 'International', flag: '🌍' },
}

export const metadata: Metadata = {
  title: 'HRDF Training Providers Malaysia | Browse All Providers',
  description: "Browse Malaysia's most complete directory of HRDF-registered training providers. Filter by category, state, country, or delivery method.",
  alternates: {
    canonical: 'https://findtraining.com/providers',
  },
  openGraph: {
    title: 'HRDF Training Providers Malaysia | Browse All Providers',
    description: "Browse Malaysia's most complete directory of HRDF-registered training providers. Filter by category, state, country, or delivery method.",
    url: 'https://findtraining.com/providers',
    siteName: 'FindTraining Malaysia',
    type: 'website',
  },
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; state?: string; delivery?: string; country?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  const [{ providers, total }, availableCountries] = await Promise.all([
    searchProviders({
      page,
      state: params.state,
      delivery: params.delivery,
      country_code: params.country,
    }),
    getDistinctCountries(),
  ])

  const totalPages = Math.ceil(total / 24)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'HRDF Training Providers Malaysia',
    description: "Malaysia's most complete directory of HRDF-registered training providers.",
    url: 'https://findtraining.com/providers',
    numberOfItems: total,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://findtraining.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Training Providers',
          item: 'https://findtraining.com/providers',
        },
      ],
    },
  }

  // Build pagination URL preserving all active filters
  function paginationHref(p: number) {
    const qs = new URLSearchParams()
    if (p > 1) qs.set('page', String(p))
    if (params.state) qs.set('state', params.state)
    if (params.delivery) qs.set('delivery', params.delivery)
    if (params.country) qs.set('country', params.country)
    const str = qs.toString()
    return `/providers${str ? `?${str}` : ''}`
  }

  // Build country filter URL
  function countryHref(code: string | null) {
    const qs = new URLSearchParams()
    if (params.state) qs.set('state', params.state)
    if (params.delivery) qs.set('delivery', params.delivery)
    if (code) qs.set('country', code)
    const str = qs.toString()
    return `/providers${str ? `?${str}` : ''}`
  }

  const activeCountry = params.country ?? null

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Providers</h1>
      <p className="text-gray-500 mb-8">
        {total.toLocaleString()} HRDF-registered and certified corporate training organisations in Malaysia.
      </p>

      {/* Country filter */}
      {availableCountries.length > 1 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Country</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={countryHref(null)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                activeCountry === null
                  ? 'bg-[#0F6FEC] text-white border-[#0F6FEC]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#0F6FEC]'
              }`}
            >
              All Countries
            </Link>
            {availableCountries.map((code) => {
              const opt = COUNTRY_OPTIONS[code]
              if (!opt) return null
              return (
                <Link
                  key={code}
                  href={countryHref(code)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    activeCountry === code
                      ? 'bg-[#0F6FEC] text-white border-[#0F6FEC]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#0F6FEC]'
                  }`}
                >
                  {opt.flag} {opt.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {providers.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {providers.map((provider: FtProviderWithCategories) => (
              <Link
                key={provider.id}
                href={`/providers/${provider.slug}`}
                className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {provider.logo_url && (
                    <img src={provider.logo_url} alt="" className="w-12 h-12 rounded object-contain flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h2 className="font-semibold text-gray-900 truncate text-sm">{cleanName(provider.name)}</h2>
                      {provider.country_code && provider.country_code !== 'MY' && COUNTRY_OPTIONS[provider.country_code] && (
                        <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                          {COUNTRY_OPTIONS[provider.country_code].flag} {provider.country_code}
                        </span>
                      )}
                    </div>
                    {provider.state && (
                      <p className="text-xs text-gray-500 mt-0.5">{provider.state}</p>
                    )}
                  </div>
                </div>
                {provider.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{provider.description}</p>
                )}
                {provider.category_names.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {provider.category_names.slice(0, 3).map((cat) => (
                      <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center">
              {page > 1 && (
                <Link href={paginationHref(page - 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  ← Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link href={paginationHref(page + 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium mb-2">No providers found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </main>
  )
}
