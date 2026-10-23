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
  { bg: 'bg-brand-blue-light', bar1: 'bg-brand-blue', bar2: 'bg-brand-teal', ink: 'text-brand-ink' },
  { bg: 'bg-brand-teal-light', bar1: 'bg-brand-teal-dark', bar2: 'bg-brand-blue', ink: 'text-brand-ink' },
  { bg: 'bg-brand-mist', bar1: 'bg-brand-blue-dark', bar2: 'bg-brand-teal', ink: 'text-brand-ink' },
] as const

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
      <div
        data-visual="cover"
        className={`relative flex items-center justify-center overflow-hidden bg-white ${size} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- provider-supplied URLs on any host */}
        <img
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
  return (
    <div
      data-visual="cover"
      aria-hidden="true"
      className={`ft-timetable relative flex items-center justify-center overflow-hidden ${tint.bg} ${size} ${className}`}
    >
      <span
        className={`font-display font-extrabold leading-none tracking-tight ${tint.ink} ${
          variant === 'tile' ? 'text-6xl' : 'text-5xl'
        }`}
      >
        {providerInitials(name)}
      </span>
      <span className="absolute left-4 bottom-4 flex items-center gap-1.5">
        <span className={`block h-2 w-9 rounded-full ${tint.bar1}`} />
        <span className={`block h-2 w-5 rounded-full ${tint.bar2}`} />
        <span className="block h-2 w-2.5 rounded-full bg-brand-ink/70" />
      </span>
    </div>
  )
}
