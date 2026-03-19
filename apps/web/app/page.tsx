import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
      <Logo className="mb-8 h-16 w-16" />
      <h1 className="mb-4 text-center text-5xl font-bold tracking-tight sm:text-7xl">
        Stop paying for 5 tools.
      </h1>
      <p className="mb-8 text-center text-3xl font-bold text-white/80 sm:text-5xl">
        Start with one.
      </p>
      <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-indigo-100">
        Website, bookings, link-in-bio, custom domain, and email — all in one
        platform. Starting at $9/mo.
      </p>
      <div className="flex gap-4">
        <Link
          href="/pricing"
          className="rounded-lg bg-white px-8 py-3 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          See Pricing
        </Link>
      </div>
    </main>
  )
}
