import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Minus, Star } from 'lucide-react'
import { getFoundingMemberCount } from '@webvillage/engine/adapters/findtraining'

export const metadata: Metadata = {
  title: 'Pricing — List Your Training Company on FindTraining',
  description:
    'Free listing for every training provider. Paid tiers from RM 100/mo (founding) or RM 300/mo (Starter) unlock direct buyer contact, enquiries, and course listings.',
  alternates: { canonical: 'https://findtraining.com/pricing' },
  openGraph: {
    url: 'https://findtraining.com/pricing',
    title: 'Pricing — List Your Training Company on FindTraining',
    description:
      'Free, Starter (RM 300/mo), and Pro (RM 800/mo) listings. Founding slots at RM 100/mo locked for life.',
  },
}

type Tier = {
  name: string
  price: string
  period?: string
  blurb: string
  highlight?: boolean
  ribbon?: string
  ctaLabel: string
  ctaHref: string
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: 'RM 0',
    blurb: 'Basic listing in the directory. No payment required.',
    ctaLabel: 'Claim your free listing',
    ctaHref: '/claim-profile',
  },
  {
    name: 'Starter',
    price: 'RM 300',
    period: '/mo',
    blurb: 'Full profile, direct contact, and 5 course listings.',
    ctaLabel: 'Choose Starter',
    ctaHref: '/claim-profile',
  },
  {
    name: 'Pro',
    price: 'RM 800',
    period: '/mo',
    blurb: 'Featured placement, unlimited courses, analytics.',
    ctaLabel: 'Choose Pro',
    ctaHref: '/claim-profile',
  },
]

type FeatureRow = {
  label: string
  free: boolean | string
  starter: boolean | string
  pro: boolean | string
}

const FEATURES: FeatureRow[] = [
  { label: 'Public profile in the directory', free: true, starter: true, pro: true },
  { label: 'Listed in category and state search', free: true, starter: true, pro: true },
  { label: 'Edit description, logo, contact details', free: 'Read-only', starter: true, pro: true },
  { label: 'Direct contact button — buyers reach you', free: false, starter: true, pro: true },
  { label: 'Enquiry form on your profile', free: false, starter: true, pro: true },
  { label: 'Email notification when an HR manager enquires', free: false, starter: true, pro: true },
  { label: 'Course / service listings', free: false, starter: 'Up to 5', pro: 'Unlimited' },
  { label: 'Featured placement at top of category', free: false, starter: false, pro: true },
  { label: 'HRDF-verified badge', free: false, starter: true, pro: true },
  { label: 'Analytics — views, clicks, search rankings', free: false, starter: 'Basic', pro: 'Full' },
  { label: 'Priority support', free: false, starter: false, pro: true },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <CheckCircle2 className="w-5 h-5 mx-auto" style={{ color: '#0F6FEC' }} aria-label="Included" />
  }
  if (value === false) {
    return <Minus className="w-5 h-5 mx-auto text-gray-300" aria-label="Not included" />
  }
  return <span className="text-xs text-gray-700 font-medium">{value}</span>
}

export default async function PricingPage() {
  const { taken, total } = await getFoundingMemberCount().catch(() => ({ taken: 0, total: 50 }))
  const foundingOpen = taken < total
  const slotsLeft = total - taken

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-dark text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple pricing for training providers</h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Every training company gets a free listing. Paid tiers unlock direct buyer contact,
            enquiries, and course listings.
          </p>
        </div>
      </section>

      {/* Founding callout */}
      {foundingOpen && (
        <section className="py-8 px-4" style={{ backgroundColor: '#F0F7FF' }}>
          <div className="max-w-3xl mx-auto flex items-start sm:items-center flex-col sm:flex-row gap-3 sm:gap-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0F6FEC' }}>
              <Star className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Founding offer: RM 100/mo — locked for life
              </p>
              <p className="text-sm text-gray-600">
                {slotsLeft} of {total} slots remaining. First 50 providers only.
              </p>
            </div>
            <Link
              href="/founding"
              className="flex-shrink-0 bg-brand-blue text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Claim a slot →
            </Link>
          </div>
        </section>
      )}

      {/* Tier cards */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border ${
                  tier.highlight ? 'border-2 shadow-md' : 'border-gray-200'
                } bg-white p-6 flex flex-col`}
                style={tier.highlight ? { borderColor: '#0F6FEC' } : {}}
              >
                {tier.ribbon && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full" style={{ backgroundColor: '#0F6FEC' }}>
                      {tier.ribbon}
                    </span>
                  </div>
                )}
                <div className="text-center mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{tier.name}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tier.price}
                    {tier.period && <span className="text-base font-normal text-gray-500">{tier.period}</span>}
                  </p>
                </div>
                <p className="text-sm text-gray-600 text-center mb-6 min-h-[2.5rem]">{tier.blurb}</p>
                <Link
                  href={tier.ctaHref}
                  className={`mt-auto block w-full text-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${
                    tier.highlight
                      ? 'bg-brand-blue text-white hover:bg-blue-700'
                      : 'border border-gray-300 text-gray-700 hover:border-brand-blue hover:text-brand-blue'
                  }`}
                >
                  {tier.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare features</h2>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-5 py-4">
                    Feature
                  </th>
                  <th className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-4 w-24">
                    Free
                  </th>
                  <th className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-4 w-24">
                    Starter
                  </th>
                  <th className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-4 w-24">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                    <td className="px-5 py-3 text-gray-700">{row.label}</td>
                    <td className="px-3 py-3 text-center"><Cell value={row.free} /></td>
                    <td className="px-3 py-3 text-center"><Cell value={row.starter} /></td>
                    <td className="px-3 py-3 text-center"><Cell value={row.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pricing questions</h2>
          <div className="space-y-5">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Do I need to pay to be listed?</p>
              <p className="text-sm text-gray-600">
                No. Every training provider sourced from official government registries is already
                indexed. You can claim your free profile without paying.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">What does Starter unlock?</p>
              <p className="text-sm text-gray-600">
                A direct contact button on your profile, the structured enquiry form, email
                notifications when an HR manager enquires, and 5 course or service listings.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">What&rsquo;s the difference between Founding and Starter?</p>
              <p className="text-sm text-gray-600">
                Same feature set. Founding members lock RM 100/mo for life. Once 50 founding slots are
                claimed, the price for new providers becomes RM 300/mo (Starter).
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Can I cancel?</p>
              <p className="text-sm text-gray-600">
                Yes — cancel any time. Founding members get a full refund within 7 days of the first
                payment.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Do you take a cut of bookings?</p>
              <p className="text-sm text-gray-600">
                No. FindTraining is a directory. Buyers contact you directly and you handle the
                engagement on your terms — no commission, no markup.
              </p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link
              href="/claim-profile"
              className="inline-block bg-brand-blue text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find your listing →
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Or email <a href="mailto:hello@findtraining.com" className="text-brand-blue hover:underline">hello@findtraining.com</a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
