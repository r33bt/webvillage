import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <nav className="border-b border-zinc-900 px-6 py-3 flex items-center gap-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-50 shrink-0">
          BrandHacker
        </Link>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/app/calendar/pat" className="hover:text-zinc-200 transition-colors">
            Calendar
          </Link>
          <span className="text-zinc-800">|</span>
          <span className="text-zinc-600 text-xs uppercase tracking-widest">internal</span>
        </div>
      </nav>
      <main className="min-h-[calc(100vh-49px)]">{children}</main>
    </div>
  )
}
