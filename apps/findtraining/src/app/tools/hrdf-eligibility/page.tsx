import type { Metadata } from 'next'
import Link from 'next/link'
import HRDFEligibilityChecker from './HRDFEligibilityChecker'

export const metadata: Metadata = {
  title: 'HRDF Eligibility Checker — Are You Required to Pay the HRD Corp Levy?',
  description:
    'Find out if your company must pay the HRD Corp (HRDF) levy and calculate your monthly and annual levy amount.',
  alternates: { canonical: 'https://findtraining.com/tools/hrdf-eligibility' },
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which companies must register with HRD Corp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Private sector employers operating in industries covered under the Pembangunan Sumber Manusia Berhad (PSMB) Act 2001 with 10 or more Malaysian employees must register with HRD Corp and pay the levy. Companies with fewer than 10 Malaysian employees but with a monthly payroll exceeding RM 500,000 may also be required to register. Smaller employers can register voluntarily.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between mandatory and voluntary HRD Corp registration?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mandatory employers (10+ Malaysian employees in covered sectors) must register and pay a 1% monthly levy on their total wage bill. Voluntary employers (fewer than 10 Malaysian employees) may choose to register at a 0.5% levy rate. Both mandatory and voluntary employers can claim the full levy amount for approved HRDF-registered training.',
      },
    },
    {
      '@type': 'Question',
      name: 'What training grants can I claim with my HRD Corp levy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Registered employers can access three main grant types: SBL-Khas, where HRD Corp pays the training provider directly; SBL (Skim Bantuan Latihan), where the employer pays upfront and claims reimbursement; and PROLUS, which supports training of unemployed Malaysians. SBL-Khas is the most commonly used scheme.',
      },
    },
  ],
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
        <p className="text-gray-600 text-base leading-relaxed">
          Find out if your company must register with HRD Corp, what levy rate applies, and how
          much annual training budget you can claim. Takes under 30 seconds.
        </p>
      </header>

      {/* Interactive checker */}
      <HRDFEligibilityChecker />

      {/* About section */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Who Must Register with HRD Corp?</h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            Under the Pembangunan Sumber Manusia Berhad (PSMB) Act 2001, private sector employers
            in designated industries are required to register with HRD Corp once they employ 10 or
            more Malaysian citizens or permanent residents. Covered sectors include manufacturing,
            services, mining and quarrying, construction, and agriculture, among others.
          </p>
          <p>
            Mandatory employers pay a 1% monthly levy on their total wage bill. This levy accumulates
            into an annual training fund that can be drawn down against any training programme
            delivered by an HRDF-registered provider. Employers with fewer than 10 Malaysian employees
            may register voluntarily at a reduced rate of 0.5%, unlocking access to the same
            grants and training network.
          </p>
          <p>
            The levy pool accrues monthly and can be claimed against SBL-Khas (direct billing),
            SBL (reimbursement), and PROLUS (pre-employment) schemes. Unused levy does not roll
            over indefinitely, so planning your annual training calendar early is essential.
          </p>
        </div>
      </section>

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              Which companies must register with HRD Corp?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Private sector employers in covered industries with 10 or more Malaysian employees
              must register and pay the 1% levy. Companies with fewer than 10 Malaysian employees
              but a monthly payroll above RM 500,000 may also be required to register. Smaller
              employers can register voluntarily at 0.5%.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              What is the difference between mandatory and voluntary registration?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mandatory employers (10+ staff) pay 1% of monthly wages and must register within
              30 days of hitting the threshold. Voluntary employers (under 10 staff) pay 0.5%
              but gain the same access to grants and HRDF-registered training programmes.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              What training grants can I claim with my levy?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              The three main schemes are SBL-Khas (HRD Corp pays the provider directly — most
              common), SBL (employer pays upfront and claims reimbursement), and PROLUS (for
              training unemployed Malaysians you plan to hire). All three draw from your
              accumulated levy balance.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Ready to use your levy?
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Browse HRDF-registered training providers and find approved courses you can claim
          against your annual levy pool.
        </p>
        <Link
          href="/providers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0F6FEC' }}
        >
          Browse HRDF-registered training providers
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
