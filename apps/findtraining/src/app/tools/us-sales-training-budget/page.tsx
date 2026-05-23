import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'US Sales Training Budget Guide — Pricing Ranges and What Drives Them',
  description:
    'Typical US sales training pricing — per-rep, per-cohort, and per-engagement — for SDR, AE, and enterprise sales programmes. What inflates the price tag.',
  alternates: { canonical: 'https://findtraining.com/tools/us-sales-training-budget' },
  openGraph: {
    title: 'US Sales Training Budget Guide — Pricing Ranges',
    description:
      'Practical US sales training pricing reference for L&D and revenue-ops buyers.',
    url: 'https://findtraining.com/tools/us-sales-training-budget',
  },
}

type Tier = {
  category: string
  perRep: string
  cohort: string
  notes: string
}

const PRICING_TABLE: Tier[] = [
  {
    category: 'SDR / BDR foundations',
    perRep: '$800 – $2,500',
    cohort: '$8,000 – $25,000 per cohort of ~10',
    notes: 'Outbound prospecting, cadence design, qualification frameworks. Often a 2-4 week onboarding programme.',
  },
  {
    category: 'AE methodology (e.g. SPIN, MEDDIC, Challenger)',
    perRep: '$1,800 – $5,000',
    cohort: '$15,000 – $50,000 for branded programmes',
    notes: 'Branded methodology licence fees account for most of the price. Includes workbooks, certification, sometimes ongoing platform access.',
  },
  {
    category: 'Sandler franchise programmes',
    perRep: '$5,000 – $12,000+ per year',
    cohort: 'Ongoing subscription model, not one-off',
    notes: 'Long-tail recurring engagement. Typical commitment is 12 months. Local franchise quality varies — vet the trainer specifically.',
  },
  {
    category: 'Enterprise / strategic accounts',
    perRep: '$5,000 – $15,000',
    cohort: '$50,000 – $150,000 multi-day programmes',
    notes: 'Custom-built for the org. ABM, executive sponsor coordination, deal coaching. Heavy facilitator and pre-work load.',
  },
  {
    category: 'Sales leadership / management',
    perRep: '$3,000 – $8,000',
    cohort: '$25,000 – $75,000',
    notes: 'Coaching cadence, pipeline review skills, forecasting. Reinforced through 1:1 coaching post-training.',
  },
]

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">US Tools</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          US Sales Training Budget Guide
        </h1>
        <p className="text-gray-600">
          The US has no government training levy — sales training is paid for entirely by the
          employer, usually out of revenue-ops or sales-enablement budgets. This page gives
          typical US market ranges and what drives the spread, so L&D and rev-ops teams can
          recognise an outlier quote when one lands.
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Category</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Per rep (USD)</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Per cohort (USD)</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_TABLE.map((row, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold text-gray-900">{row.category}</p>
                  <p className="text-xs text-gray-500 mt-1">{row.notes}</p>
                </td>
                <td className="px-4 py-4 align-top font-mono text-sm text-gray-700">{row.perRep}</td>
                <td className="px-4 py-4 align-top font-mono text-sm text-gray-700">{row.cohort}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="prose prose-sm max-w-none">
        <h2>What drives the price spread</h2>
        <ul>
          <li>
            <span className="font-medium">Branded methodology licence fees.</span> Programmes with
            certified instructors (Sandler, Challenger, MEDDIC Academy) carry licence costs that
            account for 40–60% of the headline price.
          </li>
          <li>
            <span className="font-medium">Pre-work and assessment.</span> Some providers include
            sales assessments, persona work, and pre-call shadowing — these inflate price but
            also raise post-training behaviour-change rates.
          </li>
          <li>
            <span className="font-medium">Delivery mode.</span> In-person delivery is typically
            30–50% more than virtual for the same content, due to trainer day rates and travel.
          </li>
          <li>
            <span className="font-medium">Post-training reinforcement.</span> Programmes that
            bundle ongoing manager coaching or platform access (Highspot, Mindtickle, Gong-tied
            curricula) charge a premium but show measurably better stick rates.
          </li>
        </ul>

        <h2>Where US sales training pricing differs from corporate L&D</h2>
        <p>
          US sales training pricing is benchmarked against the revenue uplift it is expected to
          produce, not against L&D budget norms. A $5,000-per-rep programme that lifts quota
          attainment by 8 percentage points pays for itself within a quarter on most B2B
          quota structures. This is why per-rep prices can look high in absolute terms but be
          rational in ROI terms.
        </p>

        <h2>How to source</h2>
        <p>
          The US sales training market has three main provider archetypes:
        </p>
        <ul>
          <li>
            <span className="font-medium">Methodology owners</span> — Sandler, Challenger,
            MEDDIC Academy, Force Management. Sell directly or through certified affiliates.
          </li>
          <li>
            <span className="font-medium">Boutique consultancies</span> — typically founder-led,
            focused on one or two verticals. Custom-build, higher per-engagement price.
          </li>
          <li>
            <span className="font-medium">Sales-enablement platforms with training arms</span>
            {' '}— Highspot, Mindtickle, Salesloft, Outreach. Bundled curricula tied to the
            platform.
          </li>
        </ul>
        <p>
          Browse US providers at{' '}
          <Link href="/us" className="text-brand-blue hover:underline">
            findtraining.com/us
          </Link>
          . Filter by Sales & Marketing category.
        </p>

        <p className="text-xs text-gray-500 mt-6">
          Ranges are 2026 market observations from public RFP responses and provider websites.
          Actual quotes vary by company size, geography, and scope.
        </p>
      </section>
    </div>
  )
}
