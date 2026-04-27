type PricingCardProps = {
  name: string
  price: string
  period?: string
  blurb: string
  features: string[]
  highlighted?: boolean
  footnote?: string
}

export function PricingCard({
  name,
  price,
  period,
  blurb,
  features,
  highlighted = false,
  footnote,
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
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-300">
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
    </div>
  )
}
