import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, CheckCircle2, Plus } from 'lucide-react'
import { searchProviders, getFoundingMemberCount } from '@webvillage/engine/adapters/findtraining'
import type { FtProviderWithCategories } from '@webvillage/engine/types/ft'

export const metadata: Metadata = {
  title: 'Claim or List Your Training Company — FindTraining',
  description:
    "Already listed? Search for your company and claim your profile. Not listed yet? Become a founding member at RM 100/mo, locked for life.",
  alternates: { canonical: 'https://findtraining.com/claim-profile' },
  openGraph: {
    url: 'https://findtraining.com/claim-profile',
    title: 'Claim or List Your Training Company — FindTraining',
    description:
      "Search for your company in the directory and claim your profile, or list a new training company.",
  },
}

function cleanName(name: string): string {
  const m = name.match(/^\*\*(.*?)\*\*/)
  return m ? m[1].trim() : name
}

export default async function ClaimProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const hasQuery = Boolean(q && q.trim().length >= 2)

  const [searchResult, foundingStatus] = await Promise.all([
    hasQuery
      ? searchProviders({ query: q!.trim(), page: 1 })
      : Promise.resolve({ providers: [], total: 0 }),
    getFoundingMemberCount().catch(() => ({ taken: 0, total: 50 })),
  ])

  const providers = searchResult.providers.slice(0, 10)
  const total = searchResult.total
  const foundingOpen = foundingStatus.taken < foundingStatus.total
  const slotsLeft = foundingStatus.total - foundingStatus.taken

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-dark text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            For training providers
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Claim or list your training company
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            FindTraining indexes 5,690+ training providers across Malaysia, Singapore, the UK,
            Australia, and the US. Find your company and claim it, or add a new listing.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Are you already listed?</h2>
            <p className="text-sm text-gray-500">
              Search for your company name. If we have a profile for you, you can claim it.
            </p>
          </div>
          <form method="GET" action="/claim-profile" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                name="q"
                type="search"
                defaultValue={q ?? ''}
                placeholder="Your company name..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
                required
                minLength={2}
              />
            </div>
            <button
              type="submit"
              className="bg-brand-blue text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {hasQuery && (
            <div className="mt-6">
              {providers.length > 0 ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    {total === 1 ? '1 match' : `${total.toLocaleString()} matches`} — click yours to claim:
                  </p>
                  <div className="space-y-2">
                    {providers.map((provider: FtProviderWithCategories) => (
                      <Link
                        key={provider.id}
                        href={`/claim/${provider.slug}`}
                        className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:border-brand-blue hover:shadow-sm transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-blue truncate">
                            {cleanName(provider.name)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {[provider.state, provider.country_code].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold text-brand-blue group-hover:underline whitespace-nowrap">
                          Claim →
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    No match for &ldquo;{q}&rdquo;
                  </p>
                  <p className="text-xs text-gray-500">
                    Try a shorter version of your company name, or add a new listing below.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* New listing CTA */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Not listed yet?</h2>
            <p className="text-sm text-gray-500">Add your company to the directory.</p>
          </div>

          {foundingOpen ? (
            <div className="bg-white rounded-2xl border-2 p-6" style={{ borderColor: '#0F6FEC' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0F6FEC1A' }}>
                  <Plus className="w-5 h-5" style={{ color: '#0F6FEC' }} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Founding Member — RM 100/mo</p>
                  <p className="text-xs text-gray-500">
                    {slotsLeft} of {foundingStatus.total} slots remaining · price locked for life
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#0F6FEC' }} />
                  Top placement in search results above free listings
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#0F6FEC' }} />
                  Direct contact button — buyers reach you, not us
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#0F6FEC' }} />
                  Up to 5 course or service listings
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#0F6FEC' }} />
                  Founding Member badge on your public profile
                </li>
              </ul>
              <Link
                href="/founding"
                className="block w-full text-center bg-brand-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reserve a founding slot →
              </Link>
              <p className="text-xs text-gray-400 mt-3 text-center">
                No payment until we confirm your slot.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <p className="font-semibold text-gray-900 mb-2">Founding programme is full</p>
              <p className="text-sm text-gray-600 mb-5">
                All {foundingStatus.total} founding slots are claimed. Join the waitlist for Starter listings at RM 300/mo.
              </p>
              <a
                href="mailto:hello@findtraining.com?subject=FindTraining%20Waitlist"
                className="inline-block bg-brand-blue text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Join Waitlist
              </a>
            </div>
          )}
        </div>
      </section>

      {/* What claiming means */}
      <section className="py-12 px-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">What claiming does</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-blue" aria-hidden="true" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Edit your profile.</span> Update description, logo, contact details, courses, and HRDF number.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-blue" aria-hidden="true" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Receive enquiries.</span> Buyers contact you through your listing once you have an active subscription.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-blue" aria-hidden="true" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Free to claim.</span> Claiming is free. Paid tiers (Founding RM 100/mo or Starter RM 300/mo) unlock contact, enquiries, and 5 course listings.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-blue" aria-hidden="true" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Manual review.</span> We verify ownership within 24 hours before activation.
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Questions? Email <a href="mailto:hello@findtraining.com" className="text-brand-blue hover:underline">hello@findtraining.com</a>
          </p>
        </div>
      </section>
    </>
  )
}
