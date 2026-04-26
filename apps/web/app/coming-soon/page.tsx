import type { Metadata } from 'next'
import { Logo } from '@/components/brand/Logo'

export const metadata: Metadata = {
  title: 'WebVillage — Launching soon',
  description:
    'AI agents + expert village for digital work at scale. Content, SEO, code, design, ops — at scale, with judgment. Launching soon.',
}

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F766E] via-[#0F766E] to-[#0C1A18] px-4">
      <div className="mx-auto max-w-2xl text-center text-white">
        <div className="mb-10 flex justify-center">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm">
            <Logo className="h-9 w-9" variant="light" />
            <span className="text-xl font-bold">WebVillage</span>
          </div>
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
          AI agents + expert village for digital work at scale.
        </h1>

        <p className="mb-3 text-xl text-white/90 sm:text-2xl">
          Content, SEO, code, design, ops &mdash; at scale, with judgment.
        </p>

        <p className="mb-12 text-lg text-white/70">
          AI agents handle volume. A vetted village of subject-matter experts handles the work that needs taste.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
          <p className="mb-1 text-sm uppercase tracking-wider text-[#D97706]">Launching soon</p>
          <p className="text-white/80">
            Want to know when we open?{' '}
            <a
              href="mailto:hello@webvillage.com?subject=Notify%20me%20when%20WebVillage%20opens"
              className="font-semibold text-[#D97706] underline-offset-4 hover:underline"
            >
              hello@webvillage.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
