import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin · WebVillage',
  description: 'Internal admin surface — Brand Engine, clients, ops.',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-semibold text-[#0F766E]">
              WebVillage Admin
            </Link>
            <span className="text-xs uppercase tracking-wider text-[#6B7C79]">Internal</span>
          </div>
          <nav className="flex items-center gap-5 text-sm font-medium text-[#6B7C79]">
            <Link href="/admin/brand-engine" className="hover:text-[#1C2B28]">Brand Engine</Link>
            <Link href="/" className="hover:text-[#1C2B28]">&larr; Public site</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
