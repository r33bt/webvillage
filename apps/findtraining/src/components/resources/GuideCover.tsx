import { CategoryArt } from '@/components/category/CategoryArt'
import { CountryArt } from '@/components/home/CountryArt'
import { RegisterArt, LevyArt } from '@/components/home/WhyArt'

/**
 * GuideCover: the designed cover for a guide card (VISUAL-KIT.md, Part B "Guides"). The kit's timetable panel
 * with the drawing that matches the guide's subject, and its category as the eyebrow. No photo, no figures.
 */

// One drawing per guide subject, chosen so neighbouring cards differ.
const BY_SLUG: Record<string, () => JSX.Element> = {
  'what-is-hrd-corp-levy': () => <LevyArt />,
  'how-to-find-hrdf-training-provider': () => <RegisterArt />,
  'best-it-training-providers-malaysia-2026': () => <CategoryArt slug="it-training" />,
  'how-to-submit-hrdf-claim-etris': () => <CategoryArt slug="human-resources" />,
  'hrdf-approved-soft-skills-training-malaysia': () => <CategoryArt slug="soft-skills" />,
  'sales-training-providers-malaysia': () => <CategoryArt slug="sales-marketing" />,
  'hrdf-levy-vs-hrd-corp-explained': () => <CategoryArt slug="compliance-legal" />,
  'training-budget-planning-malaysia': () => <CategoryArt slug="finance-accounting" />,
  'uk-apprenticeship-levy-guide': () => <CountryArt code="GB" />,
  'skillsfuture-credit-employer-guide-singapore': () => <CountryArt code="SG" />,
  'australia-rto-buyers-guide': () => <CountryArt code="AU" />,
  'sales-vs-leadership-training-when-to-spend': () => <CategoryArt slug="leadership-management" />,
  'measure-training-roi-metrics-hr-managers': () => <CategoryArt slug="technical-skills" />,
}

function artFor(slug: string): JSX.Element {
  const known = BY_SLUG[slug]
  if (known) return known()
  if (slug.includes('cost') || slug.includes('budget')) return <CategoryArt slug="finance-accounting" />
  if (slug.includes('levy') || slug.includes('claim')) return <LevyArt />
  return <CategoryArt slug="" />
}

export function GuideCover({ slug, category }: { slug: string; category: string }) {
  return (
    <div data-visual="cover" className="ft-timetable relative bg-brand-blue-light/60 px-8 pt-10">
      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-teal-dark shadow-sm">
        {category}
      </span>
      <div className="mx-auto max-w-[280px]">{artFor(slug)}</div>
    </div>
  )
}
