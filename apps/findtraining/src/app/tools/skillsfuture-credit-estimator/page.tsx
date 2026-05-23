import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SkillsFuture Credit Estimator 2026 — Singapore Employer Guide',
  description:
    'Estimate the SkillsFuture Credit and employer-side subsidies available for Singapore Citizens. Covers ETSS, SFEC, and Absentee Payroll funding stacks.',
  alternates: { canonical: 'https://findtraining.com/tools/skillsfuture-credit-estimator' },
  openGraph: {
    title: 'SkillsFuture Credit Estimator — Singapore Employer Guide',
    description:
      'How much SkillsFuture funding stacks up for Singapore training procurement: SkillsFuture Credit + SFEC + ETSS + Absentee Payroll.',
    url: 'https://findtraining.com/tools/skillsfuture-credit-estimator',
  },
}

type FundingRow = {
  scheme: string
  who: string
  what: string
  cap: string
  link?: string
}

const FUNDING_TABLE: FundingRow[] = [
  {
    scheme: 'SkillsFuture Credit',
    who: 'Singapore Citizens aged 25+',
    what: 'Individual credit to offset course fees',
    cap: 'S$500 baseline + periodic top-ups',
    link: 'https://www.skillsfuture.gov.sg',
  },
  {
    scheme: 'SkillsFuture Enterprise Credit (SFEC)',
    who: 'Qualifying SMEs',
    what: '90% subsidy on eligible workforce transformation incl. training',
    cap: 'S$10,000 per qualifying employer',
    link: 'https://www.enterprisesg.gov.sg',
  },
  {
    scheme: 'Enhanced Training Support for SMEs (ETSS)',
    who: 'SMEs sending SC/PR employees on SSG courses',
    what: 'Course-fee subsidy enhancement',
    cap: 'Up to 90% of course fees',
  },
  {
    scheme: 'Absentee Payroll (AP)',
    who: 'SMEs (SC/PR employees in training)',
    what: 'Reimbursement of basic salary during training hours',
    cap: '80% of hourly basic salary, capped at S$4.50/hr',
  },
  {
    scheme: 'Career Conversion Programme (CCP)',
    who: 'Mid-career hires moving into new sectors',
    what: 'Salary support during reskilling',
    cap: 'Up to 70-90% salary support, programme-dependent',
    link: 'https://www.wsg.gov.sg',
  },
]

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">Singapore Tools</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          SkillsFuture Credit Estimator
        </h1>
        <p className="text-gray-600">
          Singapore has the most layered training-funding regime in the region. This page maps
          which scheme applies to which scenario, so HR teams know what to claim before
          committing to a course.
        </p>
      </header>

      {/* Funding table */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Scheme</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Who qualifies</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">What it covers</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Cap</th>
            </tr>
          </thead>
          <tbody>
            {FUNDING_TABLE.map((row, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                <td className="px-4 py-3 font-semibold text-gray-900 align-top">
                  {row.scheme}
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-brand-blue hover:underline mt-0.5 font-normal"
                    >
                      Official source ↗
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 align-top">{row.who}</td>
                <td className="px-4 py-3 text-gray-700 align-top">{row.what}</td>
                <td className="px-4 py-3 text-gray-700 align-top">{row.cap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Worked example */}
      <section className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Worked example — SME upskilling 5 SC employees</h2>
        <p className="text-sm text-gray-700 mb-3">
          A 40-person SME sends 5 Singapore Citizen employees on an SSG-approved 3-day course
          listed at S$1,800 per pax (S$9,000 total).
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-blue" aria-hidden="true" />
            <span>
              <span className="font-medium">SSG + ETSS subsidy:</span> Up to 90% of course fee.
              Net employer cost: ~S$900 (10% of S$9,000).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-blue" aria-hidden="true" />
            <span>
              <span className="font-medium">Absentee Payroll:</span> 80% × hourly basic × 24 hours
              (3 days × 8) capped at S$4.50/hr. Maximum AP across 5 staff:
              5 × 24 × S$4.50 = S$540.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-blue" aria-hidden="true" />
            <span>
              <span className="font-medium">Net cost to employer:</span> Course (S$900) less AP
              reimbursement (S$540) = <span className="font-semibold">S$360 net</span> for 5
              employees attending a 3-day programme.
            </span>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-4">
          Worked example uses 2026 published rates; actual outcome depends on the specific course’s
          SSG-funded status and your SME classification.
        </p>
      </section>

      {/* Notes */}
      <section className="prose prose-sm max-w-none">
        <h2>Important caveats</h2>
        <ul>
          <li>Course must be on the SSG-funded list at the time of enrolment.</li>
          <li>Employee must be a Singapore Citizen or PR for full subsidy access.</li>
          <li>SME classification is tested on revenue and headcount — verify with EnterpriseSG.</li>
          <li>AP funding requires training during normal working hours.</li>
        </ul>
        <p>
          See the resource article on{' '}
          <Link href="/resources/skillsfuture-credit-employer-guide-singapore" className="text-brand-blue hover:underline">
            SkillsFuture Credit and Employer Funding in Singapore
          </Link>{' '}
          for deeper context, then browse SG providers at{' '}
          <Link href="/sg" className="text-brand-blue hover:underline">
            findtraining.com/sg
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
