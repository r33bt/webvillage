import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, ArrowRight, CheckCircle, Globe, MapPin, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Free Training-Funding Tools — FindTraining.com',
  description:
    'Free calculators and lookups for HRDF (Malaysia), Apprenticeship Levy (UK), SkillsFuture (Singapore), state RTO funding (Australia), and US sales training pricing.',
  alternates: { canonical: 'https://findtraining.com/tools' },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the HRD Corp levy rate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Malaysian employers pay 1% of monthly wages for companies with 10+ employees (ramai group), or 0.5% for companies with fewer than 10 employees.',
      },
    },
    {
      '@type': 'Question',
      name: 'What can I use my HRD Corp levy for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can claim HRDF-registered training courses for your employees.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who must pay the HRD Corp levy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All Malaysian employers in sectors listed under the Pembangunan Sumber Manusia Berhad (PSMB) Act 2001 with at least 10 Malaysian employees.',
      },
    },
  ],
}

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-700">Tools</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Free Training-Funding Tools
        </h1>
        <p className="text-gray-600 text-base max-w-2xl">
          Practical calculators and lookups for training procurement in Malaysia, the UK,
          Singapore, Australia, and the US. All tools are free — no sign-up required.
        </p>
      </header>

      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Malaysia</h2>
      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <Link
          href="/tools/hrdf-calculator"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-[#0F6FEC] hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors flex-shrink-0">
            <Calculator className="w-5 h-5 text-[#0F6FEC]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC] leading-snug mb-1">
              HRDF Levy Calculator
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Enter your headcount and average salary to calculate your monthly HRD Corp levy
              obligation and annual training budget.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#0F6FEC]">
            Open calculator
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/tools/hrdf-eligibility"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-[#0F6FEC] hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC] leading-snug mb-1">
              HRDF Eligibility Checker
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Find out if your company must pay the HRD Corp levy and how much your annual
              training budget will be.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#0F6FEC]">
            Check eligibility
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Link>
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">International</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        <Link
          href="/tools/uk-apprenticeship-levy-calculator"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-[#0F6FEC] hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors flex-shrink-0">
            <Calculator className="w-5 h-5 text-[#0F6FEC]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC] leading-snug mb-1">
              UK Apprenticeship Levy Calculator
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Estimate your annual Apprenticeship Levy, the 10% government top-up, and your
              digital-account funds.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#0F6FEC]">
            Open calculator
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/tools/skillsfuture-credit-estimator"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-[#0F6FEC] hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors flex-shrink-0">
            <Globe className="w-5 h-5 text-purple-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC] leading-snug mb-1">
              SkillsFuture Credit Estimator (SG)
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Map the SkillsFuture + SFEC + ETSS + Absentee Payroll stack for Singapore employers.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#0F6FEC]">
            Open estimator
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/tools/au-state-funding-lookup"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-[#0F6FEC] hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors flex-shrink-0">
            <MapPin className="w-5 h-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC] leading-snug mb-1">
              AU State Funding Lookup
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Subsidised training schemes by Australian state — Smart and Skilled, Skills First, and 6 more.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#0F6FEC]">
            Open lookup
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/tools/us-sales-training-budget"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-[#0F6FEC] hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors flex-shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC] leading-snug mb-1">
              US Sales Training Budget Guide
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Typical US sales training pricing — SDR, AE methodology, enterprise, leadership.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#0F6FEC]">
            Open guide
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Link>
      </div>

      {/* FAQ section */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              What is the HRD Corp levy rate?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Malaysian employers pay 1% of monthly wages for companies with 10 or more employees
              (ramai group), or 0.5% for companies with fewer than 10 employees.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              What can I use my HRD Corp levy for?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              You can claim HRDF-registered training courses for your employees. The full levy
              pool accumulated each year is available to offset the cost of approved training programmes.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
              Who must pay the HRD Corp levy?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              All Malaysian employers in sectors listed under the Pembangunan Sumber Manusia Berhad
              (PSMB) Act 2001 with at least 10 Malaysian employees must register and contribute.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
