import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://brandhacker.com'
  ),
  title: 'BrandHacker — One brand. Every surface.',
  description:
    'Be findable and correct in every AI answer. BrandHacker is the source of truth for your brand — upload it once, your team and your AI stay on-brand by default.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'BrandHacker',
    description:
      'Be findable and correct in every AI answer. BrandHacker is the source of truth for your brand — upload it once, your team and your AI stay on-brand by default.',
    type: 'website',
    url: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 sm:px-8 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold text-zinc-50 tracking-tight hover:text-zinc-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 rounded">
              BrandHacker
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-3.5 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              Start for free
            </Link>
          </div>
        </header>
        {children}
        <footer className="border-t border-zinc-900 mt-auto">
          <div className="mx-auto max-w-5xl px-6 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
            <span>© 2026 BrandHacker</span>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-end">
              <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
              <Link href="/case-study/v22-multibrand" className="whitespace-nowrap hover:text-zinc-300 transition-colors">Case study</Link>
              <Link href="/signup" className="whitespace-nowrap hover:text-zinc-300 transition-colors">Sign up free</Link>
              <Link href="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
