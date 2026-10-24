import { CategoryArt } from '@/components/category/CategoryArt'
import { CountryArt } from '@/components/home/CountryArt'
import { RegisterArt, LevyArt } from '@/components/home/WhyArt'

const INK = '#0F172A'
const BLUE = '#0F6FEC'
const BLUE_LIGHT = '#EBF3FE'
const TEAL = '#00C48C'
const TEAL_LIGHT = '#E0FBF4'

// A claim form going up from a laptop: for the eTRiS claim guide.
function ClaimArt() {
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <rect x="30" y="58" width="104" height="70" rx="6" fill="#fff" />
        <rect x="38" y="66" width="88" height="54" rx="2" fill={BLUE_LIGHT} />
        <path d="M22 128h120l6 10H16z" fill="#fff" />
        <path d="M82 104V80M72 90l10-10 10 10" stroke={BLUE} strokeWidth="3" />
        <path d="M150 18h66v112h-66z" fill="#fff" />
        <path d="M150 18h66v16h-66z" fill={TEAL_LIGHT} />
        <rect x="160" y="46" width="8" height="8" rx="1.5" fill={TEAL} stroke={TEAL} />
        <rect x="160" y="64" width="8" height="8" rx="1.5" fill={TEAL} stroke={TEAL} />
        <rect x="160" y="82" width="8" height="8" rx="1.5" />
        <path d="M174 50h32M174 68h28M174 86h24M160 108h46" />
        <path d="M160 116h30" stroke={BLUE} strokeWidth="3" />
      </g>
    </svg>
  )
}

// A course quote on a receipt beside a stack of coins: for the training-cost guide. No figures.
function QuoteArt() {
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M40 16h84v118l-10-6-11 6-10-6-11 6-10-6-11 6-10-6-11 6z" fill="#fff" />
        <path d="M52 36h60M52 52h44M52 66h52M52 80h36" />
        <path d="M52 100h60M52 106h60" stroke={TEAL} />
        <ellipse cx="176" cy="122" rx="30" ry="9" fill={TEAL} />
        <path d="M146 122v-10M206 122v-10" />
        <ellipse cx="176" cy="112" rx="30" ry="9" fill={TEAL_LIGHT} />
        <path d="M146 112v-10M206 112v-10" />
        <ellipse cx="176" cy="102" rx="30" ry="9" fill="#fff" />
        <path d="M146 102v-10M206 102v-10" />
        <ellipse cx="176" cy="92" rx="30" ry="9" fill={BLUE_LIGHT} />
        <path d="M168 92h16" stroke={BLUE} strokeWidth="3" />
      </g>
    </svg>
  )
}

// A year planner with booked training blocks: for the budget guide.
function PlannerArt() {
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <rect x="26" y="22" width="188" height="112" rx="6" fill="#fff" />
        <path d="M26 42h188" />
        <path d="M26 22h188v20H26z" fill={BLUE_LIGHT} />
        <path d="M58 42v92M90 42v92M122 42v92M154 42v92M186 42v92M26 70h188M26 98h188" strokeWidth="1.25" />
        <rect x="30" y="47" width="56" height="18" rx="4" fill={BLUE} stroke={BLUE} />
        <rect x="126" y="75" width="56" height="18" rx="4" fill={TEAL} stroke={TEAL} />
        <rect x="62" y="103" width="24" height="18" rx="4" fill={TEAL_LIGHT} />
        <rect x="158" y="103" width="52" height="18" rx="4" fill={BLUE_LIGHT} />
        <circle cx="46" cy="32" r="3" fill={INK} />
        <circle cx="194" cy="32" r="3" fill={INK} />
      </g>
    </svg>
  )
}

/**
 * GuideCover: the designed cover for a guide card (VISUAL-KIT.md, Part B "Guides"). The kit's timetable panel
 * with the drawing that matches the guide's subject, and its category as the eyebrow. No photo, no figures.
 */

// One drawing per guide subject, chosen so neighbouring cards differ.
const BY_SLUG: Record<string, () => JSX.Element> = {
  'what-is-hrd-corp-levy': () => <LevyArt />,
  'how-to-find-hrdf-training-provider': () => <RegisterArt />,
  'best-it-training-providers-malaysia-2026': () => <CategoryArt slug="it-training" />,
  'how-to-submit-hrdf-claim-etris': () => <ClaimArt />,
  'hrdf-approved-soft-skills-training-malaysia': () => <CategoryArt slug="soft-skills" />,
  'sales-training-providers-malaysia': () => <CategoryArt slug="sales-marketing" />,
  'hrdf-levy-vs-hrd-corp-explained': () => <CategoryArt slug="compliance-legal" />,
  'training-budget-planning-malaysia': () => <PlannerArt />,
  'uk-apprenticeship-levy-guide': () => <CountryArt code="GB" />,
  'skillsfuture-credit-employer-guide-singapore': () => <CountryArt code="SG" />,
  'australia-rto-buyers-guide': () => <CountryArt code="AU" />,
  'sales-vs-leadership-training-when-to-spend': () => <CategoryArt slug="leadership-management" />,
  'measure-training-roi-metrics-hr-managers': () => <CategoryArt slug="technical-skills" />,
}

function artFor(slug: string): JSX.Element {
  const known = BY_SLUG[slug]
  if (known) return known()
  if (slug.includes('budget')) return <PlannerArt />
  if (slug.includes('cost')) return <QuoteArt />
  if (slug.includes('levy') || slug.includes('claim')) return <LevyArt />
  return <CategoryArt slug="" />
}

export function GuideCover({ slug, category }: { slug: string; category: string }) {
  return (
    <div data-visual="cover" className="ft-timetable relative aspect-[16/9] w-full bg-brand-blue-light/60">
      <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-teal-dark shadow-sm">
        {category}
      </span>
      {/* Safe area below the label; the drawing keeps its 16:10 shape and never touches the edges. */}
      <div className="absolute inset-x-4 bottom-3 top-12 flex items-end justify-center">
        <div className="aspect-[16/10] h-full max-w-full">{artFor(slug)}</div>
      </div>
    </div>
  )
}
