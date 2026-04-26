export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
          In development
        </div>

        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
          BrandHacker
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed">
          The source of truth for your brand.
          <br />
          One place. Every surface.
        </p>

        <div className="pt-8 text-sm text-zinc-600">
          A <a href="https://webvillage.com" className="underline underline-offset-4 hover:text-zinc-400 transition-colors">WebVillage</a> product · 2026
        </div>
      </div>
    </main>
  )
}
