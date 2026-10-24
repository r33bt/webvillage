import { Search } from 'lucide-react'

/**
 * WhyArt: the three visuals for "Why HR teams use FindTraining" (VISUAL-KIT.md homepage plan step 4).
 * Two ink-line spots (a provider register, a levy worksheet) and one UI fragment of the real search with
 * its real delivery filters. No figures.
 */

const INK = '#0F172A'
const BLUE = '#0F6FEC'
const BLUE_LIGHT = '#EBF3FE'
const TEAL = '#00C48C'
const TEAL_LIGHT = '#E0FBF4'

export function RegisterArt() {
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M40 24h78v108H40zM122 24h78v108h-78z" fill="#fff" />
        <path d="M118 24c2 4 2 104 0 108" />
        <path d="M40 24h78v14H40zM122 24h78v14h-78z" fill={BLUE_LIGHT} />
        <path d="M50 52h44M50 68h52M50 84h38M50 100h48M50 116h40" />
        <path d="M132 52h40M132 68h48M132 84h34M132 100h44" />
        <path d="M188 48l4 4 6-8M188 64l4 4 6-8M188 96l4 4 6-8" stroke={TEAL} strokeWidth="2.5" />
        <circle cx="96" cy="112" r="16" fill={TEAL_LIGHT} />
        <path d="M108 124l14 14" strokeWidth="4" />
      </g>
    </svg>
  )
}

export function LevyArt() {
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M36 20h96v116H36z" fill="#fff" />
        <path d="M36 20h96v16H36z" fill={BLUE_LIGHT} />
        <path d="M48 52h56M48 66h72M48 80h48M48 94h64" />
        <path d="M48 116h72M48 121h72" stroke={TEAL} />
        <rect x="134" y="44" width="70" height="94" rx="8" fill="#fff" />
        <rect x="144" y="54" width="50" height="20" rx="3" fill={TEAL_LIGHT} />
        <path d="M146 90h10v8h-10zM164 90h10v8h-10zM182 90h10v8h-10zM146 108h10v8h-10zM164 108h10v8h-10z" />
        <path d="M182 108h10v18h-10z" fill={BLUE} stroke={BLUE} />
        <path d="M146 126h28" />
      </g>
    </svg>
  )
}

const DELIVERY = ['In-person', 'Virtual', 'Hybrid', 'E-learning']

export function SearchFragment() {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm" aria-hidden="true">
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5">
        <Search className="h-4 w-4 text-brand-blue" />
        <span className="text-sm text-gray-600">Course, skill or provider</span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Delivery</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DELIVERY.map((d, i) => (
          <span
            key={d}
            className={`rounded-full px-3 py-1 text-sm ${
              i === 0 ? 'bg-brand-blue text-white' : 'bg-brand-mist text-brand-ink'
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}
