import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Australian State Training Funding Lookup — Subsidies by State',
  description:
    'Subsidised training schemes by Australian state — NSW Smart and Skilled, VIC Skills First, QLD Certificate 3 Guarantee, WA Jobs and Skills, and more.',
  alternates: { canonical: 'https://findtraining.com/tools/au-state-funding-lookup' },
  openGraph: {
    title: 'Australian State Training Funding Lookup — Subsidies by State',
    description:
      'State-by-state map of subsidised training schemes for Australian employers.',
    url: 'https://findtraining.com/tools/au-state-funding-lookup',
  },
}

type StateScheme = {
  code: string
  name: string
  scheme: string
  who: string
  highlights: string
  source: string
}

const STATE_SCHEMES: StateScheme[] = [
  {
    code: 'NSW',
    name: 'New South Wales',
    scheme: 'Smart and Skilled',
    who: 'NSW residents, employees in priority occupations',
    highlights:
      'Subsidies on qualifications from the NSW Skills List. Apprentices and trainees fully subsidised on most qualifications.',
    source: 'https://smartandskilled.nsw.gov.au',
  },
  {
    code: 'VIC',
    name: 'Victoria',
    scheme: 'Skills First (Victorian Training Guarantee)',
    who: 'Victorian residents, eligibility rules apply (age, prior qualifications)',
    highlights:
      'Subsidised places at TAFEs and approved RTOs for AQF qualifications. Free TAFE list for priority qualifications.',
    source: 'https://www.vic.gov.au/skills-first-program',
  },
  {
    code: 'QLD',
    name: 'Queensland',
    scheme: 'Certificate 3 Guarantee + User Choice',
    who: 'Queensland residents without a prior post-school qualification',
    highlights:
      'Certificate III subsidy plus User Choice for apprentices and trainees. Higher-Level Skills programme for Cert IV and above.',
    source: 'https://desbt.qld.gov.au/training',
  },
  {
    code: 'WA',
    name: 'Western Australia',
    scheme: 'Jobs and Skills WA',
    who: 'WA residents in priority occupations',
    highlights:
      'Lower Skill Set fees for priority qualifications. State-funded apprenticeships.',
    source: 'https://www.jobsandskills.wa.gov.au',
  },
  {
    code: 'SA',
    name: 'South Australia',
    scheme: 'Subsidised Training List + WorkReady',
    who: 'SA residents, eligibility rules apply',
    highlights:
      'State-funded training places on the Subsidised Training List. Skilling SA for priority sectors.',
    source: 'https://providers.skills.sa.gov.au',
  },
  {
    code: 'TAS',
    name: 'Tasmania',
    scheme: 'Skills Tasmania subsidies',
    who: 'Tasmanian residents',
    highlights:
      'Apprenticeships fully funded. Subsidised places on Tasmania Training Plan qualifications.',
    source: 'https://www.skills.tas.gov.au',
  },
  {
    code: 'NT',
    name: 'Northern Territory',
    scheme: 'NT Apprenticeship and Traineeship subsidies',
    who: 'NT residents and employers',
    highlights:
      'Employer incentives plus apprentice support. Remote workforce focus.',
    source: 'https://nt.gov.au/employ/training-and-workforce-development',
  },
  {
    code: 'ACT',
    name: 'Australian Capital Territory',
    scheme: 'ACT subsidised training',
    who: 'ACT residents',
    highlights:
      'Skills Capital Grants and apprenticeship subsidies via the Canberra Institute of Technology and approved RTOs.',
    source: 'https://www.skills.act.gov.au',
  },
]

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">Australia Tools</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Australian State Training Funding Lookup
        </h1>
        <p className="text-gray-600">
          Subsidised training in Australia is state-administered. Each state defines its own
          subsidised training list and eligibility rules. This page links to the authoritative
          source for each state — always cross-check current scheme rules before procuring training.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {STATE_SCHEMES.map((s) => (
          <div key={s.code} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-900">
                {s.name} <span className="text-xs text-gray-400 font-normal">({s.code})</span>
              </h2>
            </div>
            <p className="text-sm font-semibold text-brand-blue mb-2">{s.scheme}</p>
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-medium text-gray-700">Eligible:</span> {s.who}
            </p>
            <p className="text-sm text-gray-700 mb-3">{s.highlights}</p>
            <a
              href={s.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
            >
              Official source <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">Federal layer: Apprenticeships</h2>
        <p className="text-sm text-gray-700">
          The Australian Apprenticeships Incentive System (AAIS) sits at the federal level and
          provides employer incentives for hiring apprentices and trainees in priority
          occupations. Payments flow through Australian Apprenticeship Support Network (AASN)
          providers, not directly between the RTO and the employer.
        </p>
        <a
          href="https://www.australianapprenticeships.gov.au"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline mt-3"
        >
          australianapprenticeships.gov.au <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </section>

      <section className="prose prose-sm max-w-none">
        <h2>Before contracting an RTO</h2>
        <ul>
          <li>Verify the RTO\'s status, scope, and registration expiry on training.gov.au.</li>
          <li>Confirm the specific qualification is on the relevant state subsidised list.</li>
          <li>Get the subsidy eligibility confirmed in writing from the RTO before signing.</li>
        </ul>
        <p>
          See the resource article on{' '}
          <Link href="/resources/australia-rto-buyers-guide" className="text-brand-blue hover:underline">
            Working with Australian RTOs
          </Link>{' '}
          for the full procurement framework. Browse AU providers at{' '}
          <Link href="/au" className="text-brand-blue hover:underline">
            findtraining.com/au
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
