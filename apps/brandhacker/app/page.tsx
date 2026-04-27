export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
          In development
        </div>

        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
          BrandHacker
        </h1>

        <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed">
          The source of truth for your brand.
          <br />
          One place. Every surface.
        </p>
      </div>
    </main>
  )
}
