import type { Metadata } from 'next'
import Link from 'next/link'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'UK Apprenticeship Levy Calculator 2026 — Estimate Your Annual Levy',
  description:
    'Free UK Apprenticeship Levy calculator for employers. Enter your annual pay bill to estimate your annual and monthly levy, using the HMRC rate and allowance.',
  alternates: { canonical: 'https://findtraining.com/tools/uk-apprenticeship-levy-calculator' },
  openGraph: {
    title: 'UK Apprenticeship Levy Calculator — Estimate Your Annual Levy',
    description:
      'Free Apprenticeship Levy calculator for UK employers. Annual pay bill → annual and monthly levy.',
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
          Enter your annual pay bill to estimate your annual and monthly Apprenticeship Levy.
          The rate and allowance come from HMRC&apos;s{' '}
          <a
            href="https://www.gov.uk/government/publications/apprenticeship-levy"
            className="text-brand-blue hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Pay Apprenticeship Levy
          </a>{' '}
          guidance on GOV.UK.
        </p>
      </header>

      <Calculator />

      <section className="mt-10 text-gray-700 leading-relaxed break-words">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">How the Apprenticeship Levy works</h2>
        <p className="mb-4">
          The Apprenticeship Levy is 0.5% of your annual pay bill, less an annual allowance of
          £15,000, so only employers with a pay bill above £3 million pay it. It is collected
          monthly through PAYE alongside Income Tax and National Insurance. In England the funds
          go into an apprenticeship service account; any government top-up and the time before
          unspent funds expire are set in the apprenticeship funding rules on GOV.UK.
        </p>
        <p className="mb-4">
          For deeper context see the resource article on the{' '}
          <Link href="/resources/uk-apprenticeship-levy-guide" className="text-brand-blue hover:underline">
            UK Apprenticeship Levy
          </Link>
          .
        </p>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-8">What this calculator does not cover</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Connected-company groups, which share one £15,000 allowance</li>
          <li>Government top-up and fund expiry in your apprenticeship service account</li>
          <li>Co-investment funding for employers who do not pay the levy</li>
          <li>Levy transfers to other employers</li>
        </ul>
        <p className="mb-4">
          For these, refer to the official guidance on{' '}
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
