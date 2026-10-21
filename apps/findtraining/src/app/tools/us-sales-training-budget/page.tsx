import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'US Sales Training Budget Checklist — Compare Quotes Like for Like',
  description:
    'What to get in writing from every US sales training provider, and what drives the price, so you can compare quotes like for like.',
  alternates: { canonical: 'https://findtraining.com/tools/us-sales-training-budget' },
  openGraph: {
    title: 'US Sales Training Budget Checklist',
    description:
      'What to get in writing from every US sales training provider so quotes compare like for like.',
    url: 'https://findtraining.com/tools/us-sales-training-budget',
  },
}

const QUOTE_CHECKLIST: Array<{ item: string; why: string }> = [
  {
    item: 'Price basis',
    why: 'Per rep, per cohort, per engagement or an annual subscription. Convert every quote to the same basis before comparing.',
  },
  {
    item: 'Number of people and cohort size',
    why: 'Ask for the price at your real headcount and the largest group one trainer will take.',
  },
  {
    item: 'Length and format',
    why: 'Hours of live training, number of sessions and how they are spread out.',
  },
  {
    item: 'Delivery mode and travel',
    why: 'In person, virtual or mixed. For in-person delivery, ask whether trainer travel and venue are included.',
  },
  {
    item: 'Methodology licence',
    why: 'Branded programmes may charge licence or certification fees. Ask whether they are one-off or renew each year.',
  },
  {
    item: 'Materials and assessments',
    why: 'Workbooks, rep assessments, pre-work and certification: included or extra.',
  },
  {
    item: 'Reinforcement after training',
    why: 'Manager coaching, follow-up sessions or platform access, and whether they are priced separately.',
  },
  {
    item: 'Customisation',
    why: 'Off-the-shelf content or built around your sales process, and what the build costs.',
  },
  {
    item: 'Terms',
    why: 'Payment schedule, minimum commitment, and cancellation or rescheduling terms.',
  },
]

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">US Tools</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          US Sales Training Budget Checklist
        </h1>
        <p className="text-gray-600">
          The US has no government training levy, so sales training is paid for by the employer.
          Get the same details in writing from every provider you are considering, and the quotes
          can be compared like for like.
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What to get in every quote</h2>
        <ul className="space-y-4">
          {QUOTE_CHECKLIST.map(({ item, why }) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1 h-4 w-4 flex-shrink-0 rounded border border-gray-300 bg-white"
              />
              <div>
                <p className="font-semibold text-gray-900">{item}</p>
                <p className="text-gray-600">{why}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="text-gray-700 leading-relaxed">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">What drives the price</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <span className="font-semibold text-gray-900">Branded methodology licence fees.</span> Programmes taught
            by certified instructors of a named methodology carry licence costs on top of the
            training itself.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Pre-work and assessment.</span> Rep assessments, persona
            work and call shadowing before the training add to the price.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Delivery mode.</span> In-person delivery adds trainer
            travel and venue costs that virtual delivery does not.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Post-training reinforcement.</span> Ongoing manager
            coaching or platform access is often sold as an add-on or a subscription.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Custom build.</span> Content built around your own sales
            process costs more than an off-the-shelf programme.
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">How to source</h2>
        <p className="mb-3">
          US sales training providers fall into three broad groups:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <span className="font-semibold text-gray-900">Methodology owners</span>, which sell their own named
            methodology directly or through certified affiliates.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Boutique consultancies</span>, often focused on one or
            two industries, which build programmes around your process.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Sales-enablement platforms with training arms</span>,
            which bundle curricula with their software.
          </li>
        </ul>
        <p>
          Browse US providers at{' '}
          <Link href="/us" className="text-brand-blue hover:underline">
            findtraining.com/us
          </Link>
          . Filter by Sales & Marketing category.
        </p>
      </section>
    </div>
  )
}
