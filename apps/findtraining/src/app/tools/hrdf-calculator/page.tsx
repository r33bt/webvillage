import type { Metadata } from 'next'
import Link from 'next/link'
import HRDFCalculator from './HRDFCalculator'
import { HRDF_SOURCES } from '@/lib/hrdf-sources'

export const metadata: Metadata = {
  title: 'HRDF Levy Calculator 2026 — Calculate Your HRD Corp Contribution',
  description:
    'Free HRD Corp levy calculator for Malaysian employers. Enter your headcount and salary to calculate your monthly HRDF levy obligation and annual training budget.',
  alternates: { canonical: 'https://findtraining.com/tools/hrdf-calculator' },
  openGraph: {
    title: 'HRDF Levy Calculator — Calculate Your HRD Corp Contribution',
    description: 'Free HRD Corp levy calculator for Malaysian employers. Calculate your monthly HRDF levy and annual training budget.',
    url: 'https://findtraining.com/tools/hrdf-calculator',
  },
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HRDF Levy Calculator',
  description:
    'Free HRD Corp levy calculator for Malaysian employers. Calculate your monthly HRDF levy obligation and annual training budget.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'MYR',
  },
  provider: {
    '@type': 'Organization',
    name: 'FindTraining.com',
    url: 'https://findtraining.com',
  },
}

const FAQS = [
  {
    q: 'What is the HRD Corp levy rate in Malaysia?',
    a: '1% of monthly wages for employers with 10 or more Malaysian employees in a covered industry, where registration is compulsory. 0.5% for employers with 5 to 9 Malaysian employees who choose to register.',
  },
  {
    q: 'How is the HRD Corp levy calculated?',
    a: 'Levy = (total wages or basic salaries + fixed allowances) x 1% or 0.5%. It is paid by the 15th of each month and may not be deducted from employees’ wages.',
  },
  {
    q: 'How much does HRD Corp pay for training?',
    a: 'Grants are paid from the levy your company has paid in. HRD Corp pays the approved amount or the actual cost, whichever is lower, within its published cost limits.',
  },
  {
    q: 'Which employees are counted for the HRD Corp levy?',
    a: 'Malaysian citizens employed for wages under a contract of service. Domestic servants are not counted.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function HRDFCalculatorPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/tools" className="hover:text-gray-700 transition-colors">Tools</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-700">HRDF Levy Calculator</span>
      </nav>

      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          HRDF Levy Calculator 2026 — Malaysia
        </h1>
        <p className="text-gray-800 text-lg leading-relaxed">
          Calculate your company&apos;s HRD Corp monthly levy contribution in seconds.
          Enter your headcount and average salary below.
        </p>
      </header>

      {/* Interactive calculator */}
      <HRDFCalculator />

      {/* About section */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">About the HRD Corp levy</h2>
        <div className="space-y-4 text-lg text-gray-800 leading-relaxed">
          <p>
            The Human Resources Development levy is collected by HRD Corp (formerly HRDF) under the
            Pembangunan Sumber Manusia Berhad (PSMB) Act 2001. Employers in covered industries with
            10 or more Malaysian employees must register and pay 1% of monthly wages. Employers
            with 5 to 9 Malaysian employees may choose to register, at 0.5%.
          </p>
          <p>
            Registered employers use the levy to fund training, mainly through HRD Corp Claimable
            Courses.{' '}
            <a href={HRDF_SOURCES.registeredEmployers} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
              HRD Corp: registration terms
            </a>
            {' · '}
            <a href={HRDF_SOURCES.hcc} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
              HRD Corp Claimable Courses
            </a>
          </p>
        </div>
      </section>

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-5">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{f.q}</h3>
              <p className="text-lg text-gray-800 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Ready to use your levy?
        </h2>
        <p className="text-lg text-gray-800 mb-4">
          Browse training providers in Malaysia and ask them about HRD Corp claimable courses.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0F6FEC' }}
        >
          Browse training providers
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </section>
    </div>
  )
}
