type PricingCardProps = {
  name: string
  price: string
  period?: string
  blurb: string
  features: string[]
  highlighted?: boolean
  footnote?: string
  ctaHref?: string
  ctaLabel?: string
}

export function PricingCard({
  name,
  price,
  period,
  blurb,
  features,
  highlighted = false,
  footnote,
  ctaHref,
  ctaLabel,
}: PricingCardProps) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-6 sm:p-8 ${
        highlighted
          ? 'border-zinc-300 bg-zinc-900/60'
          : 'border-zinc-800 bg-zinc-950'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-50">{name}</h3>
        {highlighted ? (
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-300">
            Most flexible
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-zinc-50">{price}</span>
        {period ? (
          <span className="text-sm text-zinc-400">{period}</span>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{blurb}</p>
      <ul className="mt-6 space-y-2 text-sm text-zinc-300">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden className="text-zinc-500">·</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {footnote ? (
        <p className="mt-6 text-xs text-zinc-400 leading-relaxed">{footnote}</p>
      ) : null}
      {ctaHref && ctaLabel ? (
        <a
          href={ctaHref}
          className={`mt-6 block w-full rounded-md px-4 py-2.5 text-sm font-medium text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 ${
            highlighted
              ? 'bg-zinc-50 text-zinc-950 hover:bg-zinc-200'
              : 'border border-zinc-700 text-zinc-200 hover:border-zinc-500'
          }`}
        >
          {ctaLabel}
        </a>
      ) : null}
    </div>
  )
}
