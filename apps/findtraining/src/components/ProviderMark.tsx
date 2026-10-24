'use client'

import { useState } from 'react'

/**
 * ProviderMark: the item image for a training provider (VISUAL-KIT.md, B10 directory item imagery).
 *
 * - The provider's own logo (`logo_url`, owner-supplied or from its profile) on a white panel when it exists.
 * - Otherwise, or when the logo fails to load, the designed fallback: the provider's initials in the kit's
 *   display face on a kit tint, with the timetable grid and the three session-block bars (the kit motif).
 *   Never a stock photo standing in for the business.
 */

const LEGAL_WORDS = new Set([
  'sdn', 'bhd', 'berhad', 'plt', 'ltd', 'limited', 'pte', 'pty', 'llc', 'inc', 'co', 'company', 'corp',
  'the', 'and', 'of', 'for', '&', '-', 'enterprise',
])

export function providerInitials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, ' ')
    .split(/[\s/.,\-]+/)
    .map((w) => w.replace(/[^A-Za-z0-9\u00C0-\u024F]/g, ''))
    .filter((w) => w.length > 0 && !LEGAL_WORDS.has(w.toLowerCase()))
  if (words.length === 0) return (name.trim()[0] ?? '?').toUpperCase()
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Three kit tints; the pick is stable per name so a provider keeps its colour everywhere.
const TINTS = [
  { bg: '#EBF3FE', bar1: '#0F6FEC', bar2: '#00C48C' },
  { bg: '#E0FBF4', bar1: '#00916A', bar2: '#0F6FEC' },
  { bg: '#F1F5F9', bar1: '#0A52B8', bar2: '#00C48C' },
] as const
const INK = '#0F172A'

function tintFor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return TINTS[h % TINTS.length]
}

interface ProviderMarkProps {
  name: string
  logoUrl?: string | null
  /** band: full-width strip on top of a listing card. tile: the profile header image. */
  variant?: 'band' | 'tile'
  className?: string
}

export function ProviderMark({ name, logoUrl, variant = 'band', className = '' }: ProviderMarkProps) {
  const [failed, setFailed] = useState(false)
  const showLogo = Boolean(logoUrl && logoUrl.trim()) && !failed
  const size = variant === 'tile' ? 'h-40 sm:h-44' : 'h-32'

  if (showLogo) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-white ${size} ${className}`}>
        {/* The logo itself is the item image; it counts as a visual only when it is large enough. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- provider-supplied URLs on any host */}
        <img
          data-visual="cover"
          src={logoUrl as string}
          alt={`${name} logo`}
          loading="lazy"
          className="h-[62%] w-auto max-w-[72%] object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  const tint = tintFor(name)
  const [w, h] = variant === 'tile' ? [256, 176] : [360, 128]
  const cell = 32
  return (
    <div data-visual="cover" aria-hidden="true" className={`relative overflow-hidden ${size} ${className}`}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <rect width={w} height={h} fill={tint.bg} />
        <g stroke="#0F6FEC" strokeOpacity="0.08" strokeWidth="1">
          {Array.from({ length: Math.ceil(w / cell) }, (_, i) => (
            <path key={`v${i}`} d={`M${(i + 1) * cell} 0V${h}`} />
          ))}
          {Array.from({ length: Math.ceil(h / cell) }, (_, i) => (
            <path key={`h${i}`} d={`M0 ${(i + 1) * cell}H${w}`} />
          ))}
        </g>
        <text
          x={w / 2}
          y={h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={INK}
          className="font-display"
          fontWeight="800"
          fontSize={variant === 'tile' ? 64 : 50}
          letterSpacing="-1"
        >
          {providerInitials(name)}
        </text>
        <rect x="16" y={h - 24} width="36" height="8" rx="4" fill={tint.bar1} />
        <rect x="58" y={h - 24} width="20" height="8" rx="4" fill={tint.bar2} />
        <rect x="84" y={h - 24} width="10" height="8" rx="4" fill={INK} fillOpacity="0.7" />
      </svg>
    </div>
  )
}
