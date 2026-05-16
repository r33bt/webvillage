import type { Metadata } from 'next'
import Link from 'next/link'
import { getProviderStats } from '@webvillage/engine/adapters/findtraining'
import { COUNTRY_CONFIGS } from '@/lib/countries'

export const metadata: Metadata = {
  title: 'FindTraining.com — Find Training Providers Worldwide',
  description:
    'Find training providers in Malaysia, Singapore, the UK, Australia, and the United States. Browse HRDF-registered, SkillsFuture-eligible, and accredited corporate training providers.',
  alternates: { canonical: 'https://findtraining.com' },
  openGraph: {
    url: 'https://findtraining.com',
    title: 'FindTraining.com — Find Training Providers Worldwide',
    description:
      'Find training providers in Malaysia, Singapore, the UK, Australia, and the US.',
    type: 'website',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'FindTraining.com',
  url: 'https://findtraining.com',
  description: 'Find training providers worldwide',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://findtraining.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

// Display order for country cards
const COUNTRY_ORDER = ['MY', 'SG', 'GB', 'AU', 'US']

export default async function GlobalHomePage() {
  const stats = await getProviderStats()

  const countries = COUNTRY_ORDER.map((code) => COUNTRY_CONFIGS[code]).filter(Boolean)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find the Right Training. Anywhere.
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Browse {stats.total.toLocaleString()}+ training providers across Malaysia, Singapore,
            the UK, Australia, and the US.
          </p>
          <p className="text-sm text-gray-400 mb-10">
            HRDF-registered · SkillsFuture-eligible · ISP-accredited · ASQA-registered
          </p>

          {/* Global search */}
          <form action="/search" method="GET" className="flex gap-2 max-w-xl mx-auto mb-4">
            <input
              name="q"
              type="search"
              placeholder="Search training providers worldwide..."
              className="flex-1 rounded-lg px-4 py-3 text-gray-900 text-base"
            />
            <button
              type="submit"
              className="bg-brand-blue hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
          <p className="text-xs text-gray-500">Or choose a country below to browse providers</p>
        </div>
      </section>

      {/* ── Country Cards ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Browse by Country</h2>
          <p className="text-gray-500 text-center mb-10 text-sm">
            Each country hub shows local providers, regulatory body context, and relevant funding schemes.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {countries.map((country) => (
              <Link
                key={country.code}
                href={`/${country.slug}`}
                className="group block border border-gray-200 rounded-xl p-6 hover:border-brand-blue hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                      {country.name}
                    </h3>
                    {country.regulatoryBody && (
                      <p className="text-xs text-gray-500">{country.regulatoryBody.shortName} registered</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{country.heroSubline}</p>
                <p className="mt-3 text-xs font-semibold text-brand-blue group-hover:underline">
                  Browse {country.name} providers →
                </p>
              </Link>
            ))}

            {/* Placeholder — more countries coming */}
            <div className="border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 text-sm font-medium mb-1">More countries</p>
              <p className="text-xs text-gray-400">
                Indonesia, Thailand, Philippines, and more — coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why FindTraining ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
            Why HR teams use FindTraining
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Official sources',
                body: 'All providers are sourced from official government registries — HRD Corp, SSG, ASQA, and ISP. Not aggregated from unverified listings.',
              },
              {
                title: 'Levy & grant context',
                body: 'Each country hub explains the local funding scheme — HRDF levy, SkillsFuture Credit, Apprenticeship Levy — so HR teams understand what they can claim.',
              },
              {
                title: 'One search, all providers',
                body: 'Search across categories, regions, and delivery methods. Find in-person, virtual, and hybrid options in one place.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Provider CTA ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-brand-blue text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Are You a Training Provider?</h2>
          <p className="text-blue-100 mb-8">
            List your programmes and reach HR managers across Malaysia, Singapore, the UK, Australia,
            and the US.
          </p>
          <Link
            href="/founding"
            className="inline-block bg-white text-brand-blue font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Become a Founding Member
          </Link>
        </div>
      </section>

      {/* ── Global Trust Signals ────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total.toLocaleString()}+</p>
              <p className="font-semibold text-gray-700 mb-1">Training Providers</p>
              <p className="text-sm text-gray-500">Across 5 countries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">5</p>
              <p className="font-semibold text-gray-700 mb-1">Countries</p>
              <p className="text-sm text-gray-500">Malaysia · Singapore · UK · Australia · US</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">Official</p>
              <p className="font-semibold text-gray-700 mb-1">Government Sources</p>
              <p className="text-sm text-gray-500">HRD Corp · SSG · ASQA · ISP · training.gov.au</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
