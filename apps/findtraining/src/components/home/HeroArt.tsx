import Link from 'next/link'
import { Calculator, Search } from 'lucide-react'
import { COUNTRY_CONFIGS } from '@/lib/countries'

/**
 * HeroArt: the homepage hero visual (VISUAL-KIT.md, homepage plan step 1).
 * An ink-line drawing of a training room (flipchart, course on a laptop, the wall timetable that gives
 * the kit its motif) on the timetable-grid panel, with two HTML fragments from the site's own config:
 * the country hubs with their training bodies, and the free levy calculator. No figures, no people.
 */

const INK = '#0F172A'
const BLUE = '#0F6FEC'
const BLUE_DARK = '#0A52B8'
const BLUE_LIGHT = '#EBF3FE'
const TEAL = '#00C48C'
const TEAL_LIGHT = '#E0FBF4'

function TrainingRoom() {
  return (
    <svg viewBox="0 0 640 540" className="h-auto w-full" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        {/* wall timetable: the motif */}
        <rect x="360" y="36" width="234" height="134" rx="6" fill="#fff" />
        <rect x="360" y="36" width="234" height="24" rx="6" fill={BLUE_LIGHT} />
        <path d="M406 60v110M452 60v110M498 60v110M544 60v110M360 98h234M360 134h234" strokeWidth="1.5" />
        <rect x="365" y="65" width="82" height="28" rx="6" fill={BLUE} stroke={BLUE_DARK} />
        <rect x="503" y="65" width="36" height="28" rx="6" fill={TEAL_LIGHT} />
        <rect x="457" y="102" width="36" height="28" rx="6" fill={TEAL} />
        <rect x="411" y="139" width="82" height="27" rx="6" fill={BLUE_LIGHT} />
        <rect x="549" y="139" width="40" height="27" rx="6" fill={TEAL} />
        <circle cx="372" cy="48" r="3" fill={INK} />
        <circle cx="582" cy="48" r="3" fill={INK} />

        {/* flipchart on its easel */}
        <path d="M92 360L66 500M228 360l26 140M160 360v124" />
        <rect x="60" y="112" width="200" height="248" rx="4" fill="#fff" />
        <rect x="52" y="100" width="216" height="16" rx="5" fill={BLUE_DARK} />
        <rect x="54" y="356" width="212" height="10" rx="3" fill={BLUE_LIGHT} />
        <path d="M84 146h112" stroke={BLUE} strokeWidth="7" />
        <circle cx="88" cy="182" r="4.5" fill={TEAL} stroke={TEAL} />
        <circle cx="88" cy="210" r="4.5" fill={TEAL} stroke={TEAL} />
        <circle cx="88" cy="238" r="4.5" fill={TEAL} stroke={TEAL} />
        <path d="M102 182h122M102 210h96M102 238h110" />
        <rect x="82" y="276" width="44" height="34" rx="5" fill={BLUE_LIGHT} />
        <rect x="146" y="276" width="44" height="34" rx="5" fill={TEAL_LIGHT} />
        <rect x="210" y="276" width="36" height="34" rx="5" fill={BLUE} stroke={BLUE_DARK} />
        <path d="M128 293h14M138 288l5 5-5 5M192 293h14M202 288l5 5-5 5" />
        <path d="M232 340l-10 6M222 346l3 4" stroke={BLUE} />

        {/* desk */}
        <rect x="280" y="400" width="342" height="14" rx="3" fill="#fff" />
        <path d="M300 414v92M602 414v92" strokeWidth="6" />

        {/* laptop with a course playing */}
        <rect x="390" y="262" width="170" height="120" rx="8" fill="#fff" />
        <rect x="401" y="273" width="148" height="88" rx="3" fill={BLUE_LIGHT} />
        <circle cx="475" cy="309" r="18" fill={BLUE} stroke={BLUE_DARK} />
        <path d="M469 300l14 9-14 9z" fill="#fff" stroke="#fff" strokeWidth="1.5" />
        <rect x="413" y="343" width="124" height="7" rx="3.5" fill="#fff" strokeWidth="1.5" />
        <rect x="413" y="343" width="56" height="7" rx="3.5" fill={TEAL} strokeWidth="1.5" />
        <path d="M372 382h188l14 18H358z" fill="#fff" />

        {/* notepad and pen, mug */}
        <rect x="294" y="384" width="52" height="16" rx="2" fill={TEAL_LIGHT} />
        <path d="M300 391h36M312 378l30-8" />
        <rect x="582" y="364" width="28" height="36" rx="4" fill={TEAL_LIGHT} />
        <path d="M610 372a9 9 0 0 1 0 18" />
        <path d="M590 352c-5-6 4-9 0-15M602 352c-5-6 4-9 0-15" strokeWidth="2" />

        {/* plant and floor */}
        <path d="M24 506h600" />
        <path d="M282 506l6-34h28l6 34" fill={BLUE_LIGHT} />
        <path d="M302 472c-14-18-8-36 0-44 8 8 14 26 0 44zM302 472c-20-6-30-20-28-34 14 2 26 14 28 34zM302 472c20-6 30-20 28-34-14 2-26 14-28 34z" fill={TEAL_LIGHT} />
      </g>
    </svg>
  )
}

const HUBS = ['MY', 'SG', 'GB', 'AU', 'US']
  .map((code) => COUNTRY_CONFIGS[code])
  .filter(Boolean)

export function HeroArt() {
  return (
    <div
      data-visual="spot"
      role="img"
      aria-label="Drawing of a training room: a flipchart, a course playing on a laptop and a wall timetable"
      className="ft-timetable relative order-first flex min-h-[340px] items-end lg:items-center overflow-hidden rounded-2xl border border-gray-200 bg-brand-blue-light/60 px-4 pb-4 pt-6 sm:px-8 sm:pt-10 lg:order-none lg:min-h-[640px]"
    >
      <TrainingRoom />

      {/* Fragment: the country hubs and their training bodies (from lib/countries.ts) */}
      <div className="absolute bottom-5 left-5 hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:block">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
          <Search className="h-4 w-4 text-brand-blue" aria-hidden="true" /> Country hubs
        </p>
        <ul className="mt-2 space-y-1.5">
          {HUBS.map((c) => (
            <li key={c.code} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="inline-flex h-6 w-9 items-center justify-center rounded bg-brand-mist text-xs font-bold text-brand-ink">
                {c.code}
              </span>
              {c.regulatoryBody ? c.regulatoryBody.shortName : c.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Fragment: the free levy calculator */}
      <Link
        href="/tools/hrdf-calculator"
        className="absolute bottom-5 right-5 hidden items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-brand-blue sm:flex"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-white">
          <Calculator className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-brand-ink">HRDF Levy Calculator</span>
          <span className="block text-sm text-gray-600">Free tool</span>
        </span>
      </Link>
    </div>
  )
}
