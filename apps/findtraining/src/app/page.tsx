import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Monitor, Users, DollarSign, ShieldCheck, Briefcase, TrendingUp,
  Smile, BookOpen, Scale, Wrench, UtensilsCrossed, Stethoscope,
  Factory, HeartPulse, Calculator, ClipboardCheck,
} from 'lucide-react'
import { getProviderStats, getAllCategories, getFoundingMemberCount } from '@webvillage/engine/adapters/findtraining'
import type { FtCategory } from '@webvillage/engine/types/ft'
import { COUNTRY_CONFIGS } from '@/lib/countries'
import { HeroArt } from '@/components/home/HeroArt'
import { CountryArt } from '@/components/home/CountryArt'
import { RegisterArt, LevyArt, SearchFragment } from '@/components/home/WhyArt'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'it-training': Monitor,
  'leadership-management': Users,
  'finance-accounting': DollarSign,
  'safety-health': ShieldCheck,
  'human-resources': Briefcase,
  'sales-marketing': TrendingUp,
  'customer-service': Smile,
  'soft-skills': BookOpen,
  'compliance-legal': Scale,
  'technical-skills': Wrench,
  'hospitality-tourism': UtensilsCrossed,
  'healthcare': Stethoscope,
  'manufacturing': Factory,
}

export const metadata: Metadata = {
  title: 'FindTraining.com — Find Training Providers Worldwide',
  description:
    'Find training providers in Malaysia, Singapore, the UK, Australia, and the United States. Compare corporate training providers by category, location, and delivery method.',
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
  const [stats, categories, founding] = await Promise.all([
    getProviderStats().catch(() => null),
    getAllCategories().catch(() => [] as FtCategory[]),
    getFoundingMemberCount().catch(() => ({ taken: 0, total: 50 })),
  ])

  const countries = COUNTRY_ORDER.map((code) => COUNTRY_CONFIGS[code]).filter(Boolean)
  const topCategories = categories.slice(0, 8)
  const foundingOpen = founding.taken < founding.total
  const foundingSlotsLeft = founding.total - founding.taken

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* ── Hero (VISUAL-KIT.md homepage plan step 1) ─────────────────── */}
      <section className="bg-white px-4 pb-12 pt-6 sm:pt-14 lg:pb-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-teal-dark">
              Corporate training directory
            </p>
            <h1 className="ft-blocks mt-3 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-6xl">
              Find the right training. Anywhere.
            </h1>
            <p className="mt-6 text-lg text-gray-700 sm:text-xl">
              {stats
                ? `Browse ${stats.total.toLocaleString()}+ training providers across Malaysia, Singapore, the UK, Australia and the US.`
                : 'Browse training providers across Malaysia, Singapore, the UK, Australia and the US.'}
            </p>

            {/* Global search */}
            <form action="/search" method="GET" className="mt-7 flex flex-col gap-2 sm:flex-row">
              <input
                name="q"
                type="search"
                aria-label="Search training providers"
                placeholder="Search a course, skill or provider"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-lg text-gray-900"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-blue px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Search
              </button>
            </form>
            <p className="mt-3 text-base text-gray-600">Or choose a country below to browse providers.</p>
          </div>

          <HeroArt />
        </div>
      </section>

      {/* ── Free HRDF Tools strip ──────────────────────────────────────── */}
      <section className="py-6 px-4 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:mr-2 flex-shrink-0">
              Free HRDF Tools
            </p>
            <Link
              href="/tools/hrdf-calculator"
              className="flex-1 w-full sm:w-auto flex items-center gap-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-brand-blue rounded-lg px-4 py-2.5 transition-all group"
            >
              <Calculator className="w-4 h-4 text-brand-blue flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-brand-blue">
                HRDF Levy Calculator
              </span>
              <span className="ml-auto text-xs text-gray-400 hidden sm:inline">Estimate your annual levy</span>
            </Link>
            <Link
              href="/tools/hrdf-eligibility"
              className="flex-1 w-full sm:w-auto flex items-center gap-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-brand-blue rounded-lg px-4 py-2.5 transition-all group"
            >
              <ClipboardCheck className="w-4 h-4 text-brand-blue flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-brand-blue">
                HRDF Eligibility Checker
              </span>
              <span className="ml-auto text-xs text-gray-400 hidden sm:inline">Is my company in scope?</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Country Cards ───────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="ft-blocks ft-blocks-center text-center font-display text-3xl font-bold text-brand-ink sm:text-4xl">
            Browse by country
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-gray-700">
            Each country hub shows local providers, the training body and the funding scheme employers use.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {countries.map((country, i) => (
              <Link
                key={country.code}
                href={`/${country.slug}`}
                className={`group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-brand-blue hover:shadow-md ${
                  i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
                }`}
              >
                <div data-visual="spot" className="ft-timetable bg-brand-blue-light/60 px-6 pt-5">
                  <CountryArt code={country.code} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-2xl font-bold text-brand-ink group-hover:text-brand-blue">
                    {country.name}
                  </h3>
                  {country.regulatoryBody && (
                    <p className="mt-1 text-base text-gray-700">
                      {country.regulatoryBody.shortName} · {country.regulatoryBody.levyName}
                    </p>
                  )}
                  <p className="mt-auto pt-4 text-base font-semibold text-brand-blue group-hover:underline">
                    Browse {country.name} providers →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Category ──────────────────────────────────────────── */}
      {topCategories.length > 0 && (
        <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Browse by Training Category</h2>
            <p className="text-gray-500 text-center mb-10 text-sm">
              Training categories from IT and leadership to safety and finance.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] ?? HeartPulse
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-blue hover:shadow-md transition-all group"
                  >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-4 h-4 text-brand-blue" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-blue leading-snug">
                      {cat.name}
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/categories"
                className="inline-block text-sm font-semibold text-brand-blue hover:underline"
              >
                See all {categories.length} categories →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Why FindTraining ────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-brand-mist px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="ft-blocks ft-blocks-center text-center font-display text-3xl font-bold text-brand-ink sm:text-4xl">
            Why HR teams use FindTraining
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Public registry data',
                body: 'Listings are built from public provider registries and directories, such as HRD Corp and SkillsFuture lists. Confirm a provider\'s registration with the registry before you book.',
                art: <div data-visual="spot" className="px-6 pt-4"><RegisterArt /></div>,
              },
              {
                title: 'Levy & grant context',
                body: 'Each country hub explains the local funding scheme, such as the HRDF levy, SkillsFuture Credit and the Apprenticeship Levy, so HR teams understand what they can claim.',
                art: <div data-visual="spot" className="px-6 pt-4"><LevyArt /></div>,
              },
              {
                title: 'One search, all providers',
                body: 'Search across categories, regions and delivery methods. Find in-person, virtual and hybrid options in one place.',
                art: <div data-visual="fragment" className="flex min-h-[150px] items-center px-5 pt-4"><SearchFragment /></div>,
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="ft-timetable bg-brand-blue-light/50">{item.art}</div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-brand-ink">{item.title}</h3>
                  <p className="mt-2 text-lg text-gray-700">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Provider CTA ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-brand-blue text-white text-center">
        <div className="max-w-2xl mx-auto">
          {foundingOpen && (
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              {foundingSlotsLeft} of {founding.total} founding slots remaining
            </span>
          )}
          <h2 className="text-3xl font-bold mb-4">Are You a Training Provider?</h2>
          <p className="text-blue-100 mb-8">
            {foundingOpen
              ? `List your programmes and reach HR managers across Malaysia, Singapore, the UK, Australia, and the US. First ${founding.total} providers lock RM 100/mo for life.`
              : 'List your programmes and reach HR managers across Malaysia, Singapore, the UK, Australia, and the US.'}
          </p>
          <Link
            href={foundingOpen ? '/founding' : '/claim-profile'}
            className="inline-block bg-white text-brand-blue font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {foundingOpen ? 'Become a Founding Member' : 'List Your Company'}
          </Link>
        </div>
      </section>

      {/* ── Global Trust Signals ────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats && (
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total.toLocaleString()}+</p>
                <p className="font-semibold text-gray-700 mb-1">Training Providers</p>
                <p className="text-sm text-gray-500">Across {countries.length} countries</p>
              </div>
            )}
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{countries.length}</p>
              <p className="font-semibold text-gray-700 mb-1">Countries</p>
              <p className="text-sm text-gray-500">{countries.map((c) => c.name).join(' · ')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">Public</p>
              <p className="font-semibold text-gray-700 mb-1">Registry data</p>
              <p className="text-sm text-gray-500">HRD Corp · SSG · ASQA · ISP · training.gov.au</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
