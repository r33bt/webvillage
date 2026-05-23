import type { Metadata } from 'next'
import Link from 'next/link'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'UK Apprenticeship Levy Calculator 2026 — Estimate Your Annual Levy',
  description:
    'Free UK Apprenticeship Levy calculator for employers. Enter your annual pay bill to estimate your levy contribution, government top-up, and digital-account balance.',
  alternates: { canonical: 'https://findtraining.com/tools/uk-apprenticeship-levy-calculator' },
  openGraph: {
    title: 'UK Apprenticeship Levy Calculator — Estimate Your Annual Levy',
    description:
      'Free Apprenticeship Levy calculator for UK employers. Annual pay bill → levy contribution → digital-account funds.',
    url: 'https://findtraining.com/tools/uk-apprenticeship-levy-calculator',
  },
}

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">UK Tools</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          UK Apprenticeship Levy Calculator
        </h1>
        <p className="text-gray-600">
          Enter your annual pay bill to estimate your Apprenticeship Levy contribution, the 10%
          government top-up, and the funds you can spend through your digital apprenticeship
          service account.
        </p>
      </header>

      <Calculator />

      <section className="mt-10 prose prose-sm max-w-none">
        <h2>How the Apprenticeship Levy works</h2>
        <p>
          UK employers with an annual pay bill above £3 million pay an Apprenticeship Levy of 0.5%
          on the portion above the £3m threshold. The Levy is collected monthly through PAYE
          alongside Income Tax and National Insurance, and credited into a digital apprenticeship
          service account with a 10% government top-up. Funds must be spent within 24 months of
          entering the account or they expire.
        </p>
        <p>
          For deeper context see the resource article on the{' '}
          <Link href="/resources/uk-apprenticeship-levy-guide" className="text-brand-blue hover:underline">
            UK Apprenticeship Levy
          </Link>
          .
        </p>
        <h2>What this calculator does not cover</h2>
        <ul>
          <li>Connected-company group calculations (one shared £15,000 allowance)</li>
          <li>Co-investment funding for non-levy employers (95% government, 5% employer)</li>
          <li>Levy transfer to other employers (up to 50% of annual allowance)</li>
        </ul>
        <p>
          For complex group structures, refer to the official HMRC guidance on{' '}
          <a
            href="https://www.gov.uk/government/publications/apprenticeship-levy"
            className="text-brand-blue hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            gov.uk
          </a>
          .
        </p>
      </section>
    </div>
  )
}
