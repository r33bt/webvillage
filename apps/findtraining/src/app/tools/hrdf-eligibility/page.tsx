import type { Metadata } from 'next'
import Link from 'next/link'
import HRDFEligibilityChecker from './HRDFEligibilityChecker'
import { HRDF_SOURCES } from '@/lib/hrdf-sources'

export const metadata: Metadata = {
  title: 'HRDF Eligibility Checker — Are You Required to Pay the HRD Corp Levy?',
  description:
    'Find out if your company must pay the HRD Corp (HRDF) levy and calculate your monthly and annual levy amount.',
  alternates: { canonical: 'https://findtraining.com/tools/hrdf-eligibility' },
  openGraph: {
    title: 'HRDF Eligibility Checker — Are You Required to Pay the HRD Corp Levy?',
    description: 'Find out if your company must pay the HRD Corp levy and calculate your monthly obligation.',
    url: 'https://findtraining.com/tools/hrdf-eligibility',
  },
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HRDF Eligibility Checker',
  description:
    'Find out if your company must pay the HRD Corp (HRDF) levy and calculate your monthly and annual levy amount.',
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
    q: 'Which companies must register with HRD Corp?',
    a: 'Employers in the industries covered by the PSMB Act 2001 with 10 or more Malaysian employees must register and pay a 1% monthly levy. Employers in those industries with 5 to 9 Malaysian employees may choose to register, at 0.5%. Federal and state government, local councils and statutory bodies are not covered.',
  },
  {
    q: 'Who counts as an employee?',
    a: 'A Malaysian citizen employed for wages under a contract of service. Domestic servants are not counted.',
  },
  {
    q: 'Which schemes can a registered employer use?',
    a: 'The main one is HRD Corp Claimable Courses (HCC): you train with an HRD Corp registered provider, pay nothing upfront, and HRD Corp pays the provider from your levy after approving the claim. Skim Bantuan Latihan (SBL) covers training outside registered providers: you pay, then claim reimbursement.',
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

export default function HRDFEligibilityPage() {
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
        <span className="text-gray-700">HRDF Eligibility Checker</span>
      </nav>

      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          HRDF Eligibility Checker — Are You Required to Pay the Levy?
        </h1>
        <p className="text-gray-800 text-lg leading-relaxed">
          Find out if your company must register with HRD Corp and what levy rate applies.
        </p>
      </header>

      {/* Interactive checker */}
      <HRDFEligibilityChecker />

      {/* About section */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who must register with HRD Corp?</h2>
        <div className="space-y-4 text-lg text-gray-800 leading-relaxed">
          <p>
            Two things decide it: how many Malaysian employees you have, and whether your industry
            is covered by the PSMB Act 2001. The list of covered industries was widened from
            1 March 2021. With 10 or more Malaysian employees, registration is compulsory and the
            levy is 1% of monthly wages. With 5 to 9, registration is optional and the levy is
            0.5%.
          </p>
          <p>
            Only HRD Corp can confirm whether your company is liable.{' '}
            <a href={HRDF_SOURCES.coverage} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
              See the covered industries on HRD Corp&apos;s site
            </a>
            .
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
          href="/providers"
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
