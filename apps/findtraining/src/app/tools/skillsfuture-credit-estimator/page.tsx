import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SkillsFuture Funding Map — Singapore Employer Guide',
  description:
    'Which Singapore training-funding scheme fits which case: SkillsFuture Credit, SFEC, ETSS, Absentee Payroll and the Career Conversion Programme, with where to check current rates.',
  alternates: { canonical: 'https://findtraining.com/tools/skillsfuture-credit-estimator' },
  openGraph: {
    title: 'SkillsFuture Funding Map — Singapore Employer Guide',
    description:
      'Which SkillsFuture scheme fits which training case for Singapore employers, and where to check the current rates.',
    url: 'https://findtraining.com/tools/skillsfuture-credit-estimator',
  },
}

type FundingRow = {
  scheme: string
  who: string
  what: string
  check: string
  link?: string
}

// No amounts or rates here: they are set by the agencies and change. Each row sends the reader to
// the place where the current figure is published.
const FUNDING_TABLE: FundingRow[] = [
  {
    scheme: 'SkillsFuture Credit',
    who: 'Singapore Citizens aged 25 and above',
    what: 'Individual credit to offset course fees',
    check: 'Your current balance on MySkillsFuture (log in with Singpass)',
    link: 'https://www.myskillsfuture.gov.sg',
  },
  {
    scheme: 'SkillsFuture Enterprise Credit (SFEC)',
    who: 'Qualifying employers',
    what: 'Credit towards workforce transformation costs, including training',
    check: 'Eligibility and current amount on the SFEC page at SkillsFuture Singapore',
    link: 'https://www.skillsfuture.gov.sg',
  },
  {
    scheme: 'Enhanced Training Support for SMEs (ETSS)',
    who: 'SMEs sending SC/PR employees on SSG-funded courses',
    what: 'Higher course-fee subsidy',
    check: 'The funding details of the course on MySkillsFuture',
    link: 'https://www.myskillsfuture.gov.sg',
  },
  {
    scheme: 'Absentee Payroll (AP)',
    who: 'Employers of SC/PR employees in eligible training',
    what: 'Part-reimbursement of basic salary during training hours',
    check: 'Current rates and caps published by SkillsFuture Singapore',
    link: 'https://www.skillsfuture.gov.sg',
  },
  {
    scheme: 'Career Conversion Programme (CCP)',
    who: 'Mid-career hires moving into new sectors',
    what: 'Salary support during reskilling',
    check: 'Support levels per programme at Workforce Singapore',
    link: 'https://www.wsg.gov.sg',
  },
]

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">Singapore Tools</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          SkillsFuture Funding Map
        </h1>
        <p className="text-gray-600">
          Singapore training funding comes from several schemes. This page maps which scheme
          applies to which case and where the current rates are published, so HR teams know what
          to claim before committing to a course.
        </p>
      </header>

      {/* Funding table */}
      {/* Phone: one card per scheme, so no column is cut off */}
      <section className="sm:hidden space-y-3 mb-8">
        {FUNDING_TABLE.map((row) => (
          <div key={row.scheme} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
            <h2 className="font-semibold text-gray-900">{row.scheme}</h2>
            <p className="mt-2 text-gray-700"><span className="font-medium text-gray-900">Who qualifies:</span> {row.who}</p>
            <p className="mt-1 text-gray-700"><span className="font-medium text-gray-900">What it covers:</span> {row.what}</p>
            <p className="mt-1 text-gray-700"><span className="font-medium text-gray-900">Where to check:</span> {row.check}</p>
            {row.link && (
              <a href={row.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-brand-blue hover:underline">
                Official source ↗
              </a>
            )}
          </div>
        ))}
      </section>

      <section className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Scheme</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Who qualifies</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">What it covers</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Where to check</th>
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
                <td className="px-4 py-3 text-gray-700 align-top">{row.check}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* How to work out the cost */}
      <section className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">How to work out your cost for a course</h2>
        <ol className="space-y-2 text-sm text-gray-700">
          {[
            'Find the course on MySkillsFuture and open its funding details: they show the subsidised fee for each type of trainee.',
            'Use the SME rate if your company qualifies (ETSS), and the Singapore Citizen or PR rate that applies to each employee.',
            'If the training runs in working hours, check the current Absentee Payroll rate with SkillsFuture Singapore.',
            'Ask the provider to confirm the net fee per trainee in writing before you enrol.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-blue" aria-hidden="true" />
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Notes */}
      <section className="text-gray-700 leading-relaxed break-words">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Important caveats</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Course must be on the SSG-funded list at the time of enrolment.</li>
          <li>Employee must be a Singapore Citizen or PR for full subsidy access.</li>
          <li>SME classification is tested on revenue and headcount — verify with EnterpriseSG.</li>
          <li>AP funding requires training during normal working hours.</li>
        </ul>
        <p className="mb-4">
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
