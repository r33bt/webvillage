import { Metadata } from 'next'
import { Star, CheckCircle2, GraduationCap, BookOpen, Inbox } from 'lucide-react'
import { getFoundingMemberCount } from '@webvillage/engine/adapters/findtraining'
import { FoundingFormCard, FaqSection } from './FoundingForm'

// Force dynamic so slot count reflects real submissions, not a stale build snapshot
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Founding Member — List Your Training Company',
  description: "Be first on Malaysia's HRDF training directory. Founding slots at RM 100/mo locked for life — vs RM 300/mo when we launch publicly.",
  alternates: { canonical: 'https://findtraining.com/founding' },
  robots: { index: false },
}

const SPECIFIC_BENEFITS = [
  'Profile visible to 5,750+ HR managers and employers searching for HRDF training',
  'Direct contact button on your listing — leads come straight to you',
  'Add up to 5 courses or services with full details',
  'Dashboard with real-time lead notifications by email',
  'HRDF-verified badge displayed on your public profile',
  'Priority support — real responses, not a ticket queue',
  'Rate locked for life — RM 100/mo, never increases',
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

const NEXT_STEPS = [
  {
    step: '1',
    title: 'Sign up',
    detail: 'Fill in your company name, email, and contact. Takes 90 seconds. No payment yet.',
  },
  {
    step: '2',
    title: 'Claim your profile',
    detail: "We confirm your slot within 48 hours, then you build out your full provider profile — courses, HRDF number, contact details.",
  },
  {
    step: '3',
    title: 'Get found by HR teams',
    detail: 'Your listing goes live, appearing above free providers in your category and state. HR managers find you, click your contact button, and reach you directly.',
  },
]

export default async function FoundingPage() {
  const { taken: foundingCount, total: TOTAL_SLOTS } = await getFoundingMemberCount().catch(
    () => ({ taken: 0, total: 50 })
  )
  const isFull = foundingCount >= TOTAL_SLOTS
  const slotsLeft = TOTAL_SLOTS - foundingCount
  const pctFilled = Math.round((foundingCount / TOTAL_SLOTS) * 100)

  return (
    <>
      {/* Hero */}
      <section style={{ backgroundColor: '#0F6FEC' }} className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            {isFull
              ? 'Founding programme is full'
              : 'Only 50 founding member slots available — first-come, first-served'}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Claim Your Founding Member Slot<br className="hidden sm:block" /> Before We Launch.
          </h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            FindTraining is Malaysia&apos;s HRDF training directory — built for HR managers who need to find
            the right provider fast. The first 50 providers get in at RM&nbsp;100/mo, locked for life.
            After that, it&apos;s RM&nbsp;300/mo minimum.
          </p>

          {!isFull && (
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="text-white/80">{foundingCount} of {TOTAL_SLOTS} slots claimed</span>
                <span className="text-white font-semibold">
                  {slotsLeft < 10 ? `Only ${slotsLeft} remaining` : `${slotsLeft} remaining`}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-white transition-all"
                  style={{ width: `${Math.max(pctFilled, 4)}%` }}
                  role="progressbar"
                  aria-valuenow={foundingCount}
                  aria-valuemin={0}
                  aria-valuemax={TOTAL_SLOTS}
                  aria-label={`${foundingCount} of ${TOTAL_SLOTS} founding slots claimed`}
                />
              </div>
              {foundingCount === 0 && (
                <p className="text-blue-200 text-xs mt-2 text-center">Fewer than 50 slots remain. Be the first founding member in your category.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pricing comparison */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lock in RM 100/mo before the price goes up</h2>
            <p className="text-gray-500 text-sm">Founding price is locked for life. Non-founding providers pay full price from day one.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Founding Member */}
            <div className="relative rounded-2xl border-2 p-6 shadow-md" style={{ borderColor: '#0F6FEC', backgroundColor: '#F0F7FF' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full" style={{ backgroundColor: '#0F6FEC' }}>
                  FOUNDING MEMBER
                </span>
              </div>
              <div className="text-center mt-2">
                <p className="text-3xl font-bold text-gray-900 mt-4">RM 100<span className="text-base font-normal text-gray-500">/mo</span></p>
                <p className="text-xs font-semibold mt-1" style={{ color: '#0F6FEC' }}>Locked for life — first 50 only</p>
              </div>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#0F6FEC' }} /> Top placement in search</li>
                <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#0F6FEC' }} /> Founding Member badge</li>
                <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#0F6FEC' }} /> 5 course listings</li>
                <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#0F6FEC' }} /> Lead notifications</li>
                <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#0F6FEC' }} /> Priority support</li>
              </ul>
            </div>

            {/* Future Starter */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-white opacity-75">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Future Starter</p>
                <p className="text-3xl font-bold text-gray-400">RM 300<span className="text-base font-normal">/mo</span></p>
                <p className="text-xs text-gray-400 mt-1">After launch — non-founding</p>
              </div>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> Standard placement</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> No founding badge</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> 5 course listings</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> Lead notifications</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> Standard support</li>
              </ul>
            </div>

            {/* Future Pro */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-white opacity-75">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Future Pro</p>
                <p className="text-3xl font-bold text-gray-400">RM 800<span className="text-base font-normal">/mo</span></p>
                <p className="text-xs text-gray-400 mt-1">After launch — non-founding</p>
              </div>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> Featured placement</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> No founding badge</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> Unlimited listings</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> Advanced analytics</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-300" /> Dedicated support</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">Founding price is permanent — it does not increase after the 3-month intro period.</p>
        </div>
      </section>

      {/* Specific benefits */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What you get as a founding member</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {SPECIFIC_BENEFITS.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 px-6 py-4">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#0F6FEC' }} aria-hidden="true" />
                <p className="text-sm text-gray-700 leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard features */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your provider dashboard is ready today</h2>
            <p className="text-gray-500 text-sm">Founding members get immediate access. No waiting for a public launch date.</p>
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

      {/* What happens next */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">What happens next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {NEXT_STEPS.map(({ step, title, detail }) => (
              <div key={step} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: '#0F6FEC' }}
                  >
                    {step}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-12">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-14 px-4">
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
                Founding slots are full
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                All {TOTAL_SLOTS} founding slots have been claimed. Join the waitlist and
                we&apos;ll notify you when Starter listings open at RM&nbsp;300/mo.
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

      {/* FAQ */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <FaqSection />
        </div>
      </section>
    </>
  )
}
