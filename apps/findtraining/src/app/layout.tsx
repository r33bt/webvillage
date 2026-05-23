import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { MobileMenu } from '@/components/MobileMenu'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://findtraining.com'),
  title: {
    default: 'FindTraining.com — Find Training Providers Worldwide',
    template: '%s | FindTraining.com',
  },
  description:
    'Find training providers in Malaysia, Singapore, the UK, Australia, and the US. Browse HRDF-registered, SkillsFuture-eligible, and accredited corporate training providers.',
  keywords: [
    'training providers',
    'HRDF training Malaysia',
    'SkillsFuture Singapore',
    'corporate training',
    'professional development',
    'sales training',
    'HRD Corp',
    'training directory',
  ],
  openGraph: {
    title: 'FindTraining — Find Training Providers Worldwide',
    description:
      'Find training providers in Malaysia, Singapore, the UK, Australia, and the US.',
    type: 'website',
    locale: 'en',
    siteName: 'FindTraining',
  },
  alternates: {
    canonical: 'https://findtraining.com',
  },
  other: {
    'theme-color': '#0F6FEC',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen bg-white">
          {/* ── Navigation ─────────────────────────────────────────────── */}
          <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-2 group"
                  aria-label="FindTraining home"
                >
                  <GraduationCap
                    className="w-7 h-7 flex-shrink-0"
                    style={{ color: '#0F6FEC' }}
                    aria-hidden="true"
                  />
                  <span className="text-xl font-bold tracking-tight" style={{ color: '#0F6FEC' }}>
                    FindTraining
                  </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                  <Link
                    href="/search"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Browse
                  </Link>
                  <Link
                    href="/categories"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/tools"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Tools
                  </Link>
                  <Link
                    href="/about"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    About
                  </Link>
                </nav>

                {/* Mobile hamburger */}
                <MobileMenu />
              </div>
            </div>
          </header>

          {/* ── Page content ─────────────────────────────────────────── */}
          <main className="flex-1">{children}</main>

          {/* ── Footer ───────────────────────────────────────────────── */}
          <footer className="border-t border-gray-100 bg-gray-50 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <p>© {new Date().getFullYear()} FindTraining.com</p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  <Link href="/about" className="hover:text-gray-700 transition-colors">
                    About
                  </Link>
                  <Link href="/claim-profile" className="hover:text-gray-700 transition-colors">
                    For Providers
                  </Link>
                  <Link href="/contact" className="hover:text-gray-700 transition-colors">
                    Contact
                  </Link>
                  <Link href="/privacy" className="hover:text-gray-700 transition-colors">
                    Privacy
                  </Link>
                  <Link href="/terms" className="hover:text-gray-700 transition-colors">
                    Terms
                  </Link>
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
                    Official Sources · 5 Countries
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
