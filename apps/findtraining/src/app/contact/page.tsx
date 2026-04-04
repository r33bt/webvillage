import { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Clock, FileQuestion, AlertCircle, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact FindTraining — Get in Touch',
  description:
    'Contact the FindTraining.com team for provider listings, data corrections, partnerships, or general enquiries. We respond within 2 business days.',
  alternates: { canonical: 'https://findtraining.com/contact' },
}

const TOPICS = [
  {
    icon: Users,
    heading: 'Claim or update your listing',
    body: 'You\'re already listed if your company is registered with HRD Corp. To claim your profile, update contact details, or correct information on your listing.',
    cta: { label: 'Claim your listing', href: '/founding' },
  },
  {
    icon: AlertCircle,
    heading: 'Data correction or opt-out',
    body: 'If your company details are wrong, or you wish to be removed from the directory, email us with "Correction Request" or "Opt-Out Request" in the subject line. We action removals within 5 working days.',
    email: true,
  },
  {
    icon: FileQuestion,
    heading: 'General enquiries',
    body: 'Partnerships, media, API access, or anything else — email us and we\'ll route your message to the right person.',
    email: true,
  },
]

export default function ContactPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Contact</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact us</h1>
          <p className="text-base text-gray-600 leading-relaxed">
            We&apos;re a small team — email is the fastest way to reach us.
          </p>
        </div>

        {/* Primary contact */}
        <section className="rounded-xl border border-[#0F6FEC]/20 bg-blue-50 p-6 mb-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0F6FEC]/10 flex-shrink-0">
            <Mail className="w-6 h-6 text-[#0F6FEC]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-0.5">Email us at</p>
            <a
              href="mailto:hello@findtraining.com"
              className="text-xl font-semibold text-[#0F6FEC] hover:underline"
            >
              hello@findtraining.com
            </a>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              We respond within 2 business days (Mon–Fri, Malaysia time)
            </p>
          </div>
        </section>

        {/* Topic cards */}
        <section className="space-y-4 mb-10">
          <h2 className="text-lg font-semibold text-gray-900">What can we help with?</h2>
          {TOPICS.map(({ icon: Icon, heading, body, cta, email }) => (
            <div key={heading} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-gray-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{heading}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{body}</p>
                  {cta && (
                    <Link
                      href={cta.href}
                      className="inline-flex items-center text-sm font-medium text-[#0F6FEC] hover:underline"
                    >
                      {cta.label} →
                    </Link>
                  )}
                  {email && (
                    <a
                      href="mailto:hello@findtraining.com"
                      className="inline-flex items-center text-sm font-medium text-[#0F6FEC] hover:underline"
                    >
                      hello@findtraining.com
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Provider claim CTA */}
        <section className="rounded-xl bg-gray-50 border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Are you a training provider?</h2>
          <p className="text-sm text-gray-600 mb-3">
            Claim your listing to manage your profile, add courses, and get leads from HR managers
            searching for providers like you.
          </p>
          <Link
            href="/founding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#00C48C' }}
          >
            View founding member offer
          </Link>
        </section>
      </div>
    </div>
  )
}
