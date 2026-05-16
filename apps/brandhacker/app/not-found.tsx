import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">404</div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found.</h1>
      <p className="mt-4 text-zinc-400 max-w-sm leading-relaxed">
        This page doesn&apos;t exist. If you followed a link, it may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      >
        Back to BrandHacker
        <span aria-hidden>→</span>
      </Link>
    </main>
  )
}
