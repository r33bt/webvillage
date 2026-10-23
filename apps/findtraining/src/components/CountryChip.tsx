/**
 * CountryChip: the kit's country mark (VISUAL-KIT.md A7). A short code in a rounded chip, used wherever the
 * site used to show a flag emoji. No emoji, no drawn flags.
 */

interface CountryChipProps {
  code: string
  tone?: 'light' | 'dark' | 'active'
  className?: string
}

export function CountryChip({ code, tone = 'light', className = '' }: CountryChipProps) {
  const label = code === 'ZZ' ? 'INTL' : code
  const toneClass =
    tone === 'dark'
      ? 'bg-white/15 text-white'
      : tone === 'active'
        ? 'bg-white/20 text-white'
        : 'bg-brand-mist text-brand-ink'
  return (
    <span
      className={`inline-flex h-5 min-w-[2rem] items-center justify-center rounded px-1.5 text-[11px] font-bold leading-none tracking-wide ${toneClass} ${className}`}
    >
      {label}
    </span>
  )
}
