import { Metadata } from 'next'
import { Star, Award, TrendingDown, CheckCircle2, GraduationCap, BookOpen, Inbox } from 'lucide-react'
import { getFoundingMemberCount } from '@webvillage/engine/adapters/findtraining'
import { FoundingFormCard, FaqSection } from './FoundingForm'

// Force dynamic so slot count reflects real submissions, not a stale build snapshot
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Founding Member — List Your Company | FindTraining',
  description: "Be first on Malaysia's HRDF training directory. 30 founding slots at RM 100/mo for 3 months — top placement, founding badge, and early access.",
  alternates: { canonical: 'https://findtraining.com/founding' },
  robots: { index: false },
}

const BENEFITS = [
  {
    icon: Star,
    title: 'Top Placement',
    description: 'Your profile appears above free listings from day one. When HR managers search by category or state, founding members surface first.',
  },
  {
    icon: Award,
    title: 'Founding Member Badge',
    description: 'A permanent badge on your profile showing you were among the first. Trust signals matter — HR managers choose providers they can verify.',
  },
  {
    icon: TrendingDown,
    title: 'RM 100/mo for 3 months',
    description: 'Founding price locked in before launch. After 3 months, Starter continues at RM 300/mo. You save 67% on your first quarter.',
  },
]

const DASHBOARD_FEATURES = [
  {
    icon: GraduationCap,
    label: 'Provider profile editor',
    detail: 'Logo, company description, HRDF number, contact details — all editable from day one.',
  },
  {
    icon: BookOpen,
    label: 'Course listings (up to 5)',
    detail: 'Add your training programmes with titles, duration, delivery method, and HRDF claimable flag.',
  },
  {
    icon: Inbox,
    label: 'Leads inbox',
    detail: 'Receive enquiries directly from HR managers browsing FindTraining.',
  },
  {
    icon: Star,
    label: 'Founding Member badge on your public profile',
    detail: 'Visible to every HR manager who views your listing.',
  },
]

export default async function FoundingPage() {
  const { taken: foundingCount, total: TOTAL_SLOTS } = await getFoundingMemberCount().catch(
    () => ({ taken: 0, total: 30 })
  )
  const isFull = foundingCount >= TOTAL_SLOTS
  const slotsLeft = TOTAL_SLOTS - foundingCount
  const pctFilled = Math.round((foundingCount / TOTAL_SLOTS) * 100)

  return (
    <>
      <section style={{ backgroundColor: '#0F6FEC' }} className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            {isFull
              ? 'Founding programme is full'
              : `Limited — ${TOTAL_SLOTS} founding slots`}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Be First on FindTraining.<br className="hidden sm:block" /> Get Listed Before We Launch.
          </h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            We&apos;re building Malaysia&apos;s cleanest HRDF training directory. Founding members get top placement,
            a founding badge, and RM&nbsp;100/mo for 3 months — locked in before the price goes up.
          </p>

          {!isFull && (
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="text-white/80">{foundingCount} of {TOTAL_SLOTS} slots claimed</span>
                <span className="text-white font-semibold">{slotsLeft} remaining</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-white transition-all"
                  style={{ width: `${pctFilled}%` }}
                  role="progressbar"
                  aria-valuenow={foundingCount}
                  aria-valuemin={0}
                  aria-valuemax={TOTAL_SLOTS}
                  aria-label={`${foundingCount} of ${TOTAL_SLOTS} founding slots claimed`}
                />
              </div>
              {foundingCount === 0 && (
                <p className="text-blue-200 text-xs mt-2 text-center">Be the first founding member in your category.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why join as a Founding Member?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4" style={{ backgroundColor: '#0F6FEC1A' }}>
                  <Icon className="w-5 h-5" style={{ color: '#0F6FEC' }} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard features — what they get RIGHT NOW */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your provider dashboard is ready today</h2>
            <p className="text-gray-500 text-sm">Founding members get immediate access to the full provider dashboard. No waiting for launch.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DASHBOARD_FEATURES.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: '#0F6FEC1A' }}>
                  <Icon className="w-4 h-4" style={{ color: '#0F6FEC' }} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-semibold">No payment until we confirm your slot.</span>{' '}
              Reserve now, pay only after we personally review and approve your application.
              Full refund within 7 days of your first payment.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-md mx-auto">
          {isFull ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                style={{ backgroundColor: '#F590001A' }}
              >
                <svg
                  className="w-7 h-7"
                  style={{ color: '#F59000' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Founding programme is full
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                All {TOTAL_SLOTS} founding slots have been claimed. Join the waitlist and
                we&apos;ll notify you when a spot opens or when Starter listings launch.
              </p>
              <a
                href="mailto:hello@findtraining.com?subject=FindTraining%20Waitlist"
                className="inline-block px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#0F6FEC' }}
              >
                Join Waitlist
              </a>
            </div>
          ) : (
            <FoundingFormCard foundingCount={foundingCount} totalSlots={TOTAL_SLOTS} />
          )}
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <FaqSection />
        </div>
      </section>
    </>
  )
}
