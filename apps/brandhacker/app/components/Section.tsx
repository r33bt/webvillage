import type { ReactNode } from 'react'

type SectionProps = {
  id?: string
  eyebrow?: string
  heading?: string
  intro?: string
  children?: ReactNode
  className?: string
  /** When true, narrows the content column for prose-heavy sections. */
  narrow?: boolean
}

export function Section({
  id,
  eyebrow,
  heading,
  intro,
  children,
  className = '',
  narrow = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`px-6 sm:px-8 py-20 sm:py-28 border-t border-zinc-900 ${className}`}
    >
      <div className={`mx-auto ${narrow ? 'max-w-3xl' : 'max-w-5xl'}`}>
        {eyebrow ? (
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
            {eyebrow}
          </div>
        ) : null}
        {heading ? (
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-50">
            {heading}
          </h2>
        ) : null}
        {intro ? (
          <p className="mt-4 text-lg text-zinc-300 leading-relaxed max-w-2xl">
            {intro}
          </p>
        ) : null}
        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  )
}
