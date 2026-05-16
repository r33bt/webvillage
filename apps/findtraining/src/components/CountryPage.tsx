// CountryPage — shared server component for all country hub pages (/my, /sg, /gb, /au, /us)
// Each country's page.tsx passes its countryCode; this component fetches data + renders.

import Link from 'next/link'
import { getAllCategories, getFeaturedProviders, getCountryStats, getCategoryCountsByCountry } from '@webvillage/engine/adapters/findtraining'
import type { FtCategory, FtProvider } from '@webvillage/engine/types/ft'
import { COUNTRY_CONFIGS, getOtherCountries } from '@/lib/countries'
import type { CountryConfig } from '@/lib/countries'

// Malaysian states for the Browse by State section
const MY_STATES = [
  'Selangor',
  'Kuala Lumpur',
  'Johor',
  'Penang',
  'Perak',
  'Sabah',
  'Sarawak',
  'Negeri Sembilan',
  'Pahang',
  'Kedah',
  'Melaka',
  'Kelantan',
  'Terengganu',
  'Perlis',
  'Putrajaya',
  'Labuan',
]

export default async function CountryPage({ countryCode }: { countryCode: string }) {
  const config: CountryConfig | undefined = COUNTRY_CONFIGS[countryCode]
  if (!config) return null

  const [categories, featured, stats, categoryCounts] = await Promise.all([
    getAllCategories(),
    getFeaturedProviders(6, countryCode),
    getCountryStats(countryCode),
    getCategoryCountsByCountry(countryCode),
  ])

  const otherCountries = getOtherCountries(countryCode)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FindTraining', item: 'https://findtraining.com' },
      { '@type': 'ListItem', position: 2, name: config.name, item: `https://findtraining.com/${config.slug}` },
    ],
  }

  const regionsLabel = config.hasStateData
    ? `${stats.states.length} states`
    : stats.states.length > 0
      ? `${stats.states.length} regions`
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── [1] Hero ───────────────────────────────────────────────────── */}
      <section className="bg-brand-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Country pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>{config.flag}</span>
            <span>{config.name}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.heroHeadline}</h1>
          <p className="text-xl text-gray-300 mb-2">{config.heroSubline}</p>
          <p className="text-sm text-gray-400 mb-8">
            {stats.total.toLocaleString()} providers
            {regionsLabel ? ` · ${regionsLabel}` : ''}
            {categories.length > 0 ? ` · ${categories.length} categories` : ''}
          </p>

          {/* Search */}
          <form action="/search" method="GET" className="flex gap-2 max-w-xl mx-auto mb-6">
            <input type="hidden" name="country" value={config.code} />
            <input
              name="q"
              type="search"
              placeholder={`Search ${config.name} training providers...`}
              className="flex-1 rounded-lg px-4 py-3 text-gray-900 text-base"
            />
            <button
              type="submit"
              className="bg-brand-blue hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Country switcher */}
          <p className="text-xs text-gray-500">
            Also:{' '}
            {otherCountries.map((c, i) => (
              <span key={c.code}>
                {i > 0 && <span className="mx-1.5">·</span>}
                <Link href={`/${c.slug}`} className="text-gray-400 hover:text-white transition-colors">
                  {c.flag} {c.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── [2] Country Context Bar ─────────────────────────────────────── */}
      {config.regulatoryBody && (
        <section className="bg-blue-50 border-y border-blue-100 py-5 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {config.regulatoryBody.acronym} Registered
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">{config.regulatoryBody.shortName} — </span>
                  {config.regulatoryBody.levyExplainer}
                </p>
                <a
                  href={config.regulatoryBody.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  {config.regulatoryBody.name} →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── [3] Browse by Category ──────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: FtCategory) => {
                const count = categoryCounts[cat.id] ?? 0
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}?country=${config.code}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-brand-blue hover:shadow-sm transition-all"
                  >
                    <span className="font-medium text-gray-900 text-sm block">{cat.name}</span>
                    {count > 0 && (
                      <span className="text-xs text-gray-500 mt-1 block">
                        {count.toLocaleString()} provider{count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── [4] Browse by State (MY only) ───────────────────────────────── */}
      {config.hasStateData && (
        <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by State</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {MY_STATES.map((state) => (
                <Link
                  key={state}
                  href={`/search?country=${config.code}&state=${encodeURIComponent(state)}`}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-brand-blue hover:text-brand-blue transition-all text-center"
                >
                  {state}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── [5] How It Works ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: 1,
                title: 'Search Providers',
                body: `Find ${config.regulatoryBody ? `${config.regulatoryBody.acronym}-registered` : 'accredited'} providers that match your training needs by category${config.hasStateData ? ', state,' : ''} or keyword.`,
              },
              {
                n: 2,
                title: 'Review Profiles',
                body: `See contact details, courses offered, delivery methods, and ${config.regulatoryBody ? `${config.regulatoryBody.acronym} registration` : 'accreditation'} status.`,
              },
              { n: 3, title: config.howItWorksStep3.title, body: config.howItWorksStep3.body },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 flex-shrink-0"
                  style={{ backgroundColor: '#0F6FEC' }}
                >
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── [6] Featured Providers ──────────────────────────────────────── */}
      {featured.length > 0 ? (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Providers</h2>
              <Link
                href={`/search?country=${config.code}`}
                className="text-brand-blue font-medium hover:underline text-sm"
              >
                View all {stats.total.toLocaleString()} {config.name} providers →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((provider: FtProvider) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.slug}`}
                  className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {provider.logo_url && (
                      <img
                        src={provider.logo_url}
                        alt=""
                        className="w-12 h-12 rounded object-contain flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
                      {provider.state && (
                        <p className="text-sm text-gray-500 mt-0.5">{provider.state}</p>
                      )}
                      {provider.hrdf_status === 'registered' && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          HRDF Registered
                        </span>
                      )}
                    </div>
                  </div>
                  {provider.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{provider.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Claim Your Profile</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Your training company may already be listed. Claim your profile to add courses, contact
              details, and appear as a featured provider.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/founding"
                className="inline-block bg-brand-blue text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Claim as Founding Member
              </Link>
              <Link
                href={`/search?country=${config.code}`}
                className="inline-block bg-white border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg hover:border-gray-400 transition-colors"
              >
                Browse {stats.total.toLocaleString()} Providers →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── [7] Country Tools (MY only for now) ─────────────────────────── */}
      {config.tools.length > 0 && (
        <section className="py-12 px-4 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {config.regulatoryBody?.acronym} Tools & Calculators
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {config.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block p-5 border border-gray-200 rounded-lg hover:border-brand-blue hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{tool.label}</h3>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── [8] FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {config.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── [9] Provider CTA ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-brand-blue text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Are You a Training Provider in {config.name}?</h2>
          <p className="text-blue-100 mb-2">
            List your training programmes and reach thousands of HR professionals.
          </p>
          <p className="text-blue-200 text-sm mb-8">
            From {config.pricingCTA.currency}{config.pricingCTA.starterRange} · Cancel anytime
          </p>
          <Link
            href="/founding"
            className="inline-block bg-white text-brand-blue font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Become a Founding Member
          </Link>
        </div>
      </section>

      {/* ── [10] Trust Signals ──────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total.toLocaleString()}+</p>
              <p className="font-semibold text-gray-700 mb-1">Training Providers</p>
              <p className="text-sm text-gray-500">
                {config.name}
                {config.regulatoryBody
                  ? `'s most complete ${config.regulatoryBody.acronym} directory`
                  : ' training directory'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{categories.length}</p>
              <p className="font-semibold text-gray-700 mb-1">Training Categories</p>
              <p className="text-sm text-gray-500">From IT to soft skills, sales to compliance</p>
            </div>
            <div>
              {regionsLabel ? (
                <>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.states.length}</p>
                  <p className="font-semibold text-gray-700 mb-1">
                    {config.hasStateData ? 'States Covered' : 'Regions Covered'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Providers across all {config.name}{' '}
                    {config.hasStateData ? 'states and territories' : 'regions'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900 mb-1">Global</p>
                  <p className="font-semibold text-gray-700 mb-1">Reach</p>
                  <p className="text-sm text-gray-500">
                    Providers offering in-person and virtual training
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
