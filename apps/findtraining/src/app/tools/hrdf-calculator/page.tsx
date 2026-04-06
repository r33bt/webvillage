import type { Metadata } from 'next'
import Link from 'next/link'
import HRDFCalculator from './HRDFCalculator'

export const metadata: Metadata = {
  title: 'HRDF Levy Calculator 2026 — Calculate Your HRD Corp Contribution',
  description:
    'Free HRD Corp levy calculator for Malaysian employers. Enter your headcount and salary to calculate your monthly HRDF levy obligation and annual training budget.',
  alternates: { canonical: 'https://findtraining.com/tools/hrdf-calculator' },
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the HRD Corp levy rate in Malaysia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The HRD Corp levy rate is 1% of monthly wages for companies with 10 or more employees (mandatory group), and 0.5% for companies with fewer than 10 Malaysian employees (voluntary group).',
      },
    },
    {
      '@type': 'Question',
      name: 'How is the HRDF levy calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The monthly levy is calculated by multiplying total monthly wages (number of employees × average salary) by the applicable levy rate (1% or 0.5%). The annual levy pool is the monthly levy multiplied by 12.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I claim the full HRD Corp levy for training?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The full annual levy pool can be used to claim HRDF-registered training courses for your employees. You should plan your training calendar early to make the most of your contribution.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which employees are counted for the HRD Corp levy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Only Malaysian citizens and permanent residents are counted. Foreign employees are generally excluded from the headcount used to determine levy obligations under the PSMB Act 2001.',
      },
    },
    {
      '@type': 'Question',
      name: 'When must employers register with HRD Corp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Employers in covered sectors must register with HRD Corp within 30 days of meeting the threshold of 10 Malaysian employees. Voluntary registration is available for employers with fewer than 10 employees.',
      },
    },
  ],
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
        <p className="text-gray-600 text-base leading-relaxed">
          Calculate your company&apos;s HRD Corp monthly levy contribution in seconds.
          Enter your headcount and average salary below.
        </p>
      </header>

      {/* Interactive calculator */}
      <HRDFCalculator />

      {/* About section */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About the HRD Corp Levy</h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            The Human Resources Development (HRD) levy is a mandatory contribution collected by
            HRD Corp (formerly HRDF) under the Pembangunan Sumber Manusia Berhad (PSMB) Act 2001.
            Employers in covered sectors who have 10 or more Malaysian employees must register and
            contribute 1% of their total monthly wage bill each month. This creates an annual
            training fund that employers can draw down to pay for approved courses and programmes.
          </p>
          <p>
            Employers with fewer than 10 Malaysian employees may register voluntarily at a reduced
            rate of 0.5% of monthly wages. Voluntary registration still unlocks access to the full
            suite of HRDF-registered training providers and grants, making it financially attractive
            for smaller companies with active learning and development programmes.
          </p>
          <p>
            The levy pool accrues monthly and can be claimed against any training programme
            delivered by an HRDF-registered provider. Unused levy does not roll over indefinitely —
            HRD Corp periodically reclaims dormant funds — so it pays to map your annual training
            calendar against your projected levy pool early in the financial year.
          </p>
        </div>
      </section>

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              What is the HRD Corp levy rate in Malaysia?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              The rate is 1% of monthly wages for companies with 10 or more employees (mandatory),
              and 0.5% for companies with fewer than 10 Malaysian employees (voluntary).
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              How is the HRDF levy calculated?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Monthly levy = (number of employees &times; average monthly salary) &times; levy rate.
              Annual levy pool = monthly levy &times; 12. This calculator does all the maths for you.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              Can I claim the full HRD Corp levy for training?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Yes. The full annual levy pool can be used to claim costs for HRDF-registered training
              courses. Plan your training calendar early to use your full entitlement before the
              year-end.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              Which employees are counted for the HRD Corp levy?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Only Malaysian citizens and permanent residents are counted for the purpose of
              determining levy obligations. Foreign employees are generally excluded from the
              headcount under the PSMB Act 2001.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              When must employers register with HRD Corp?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Employers in covered sectors must register within 30 days of reaching the threshold
              of 10 Malaysian employees. Voluntary registration is open at any time for smaller
              employers who want to access the training grant system.
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
          href="/search"
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
