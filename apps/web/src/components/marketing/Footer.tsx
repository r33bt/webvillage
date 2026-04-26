import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

const FOOTER_LINKS = [
  { href: '/platform', label: 'Platform' },
  { href: '/#verticals', label: 'Verticals' },
  { href: '/directories', label: 'Directories' },
  { href: '/directories/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="bg-[#0C1A18] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2.5">
              <Logo className="h-8 w-8" variant="light" />
              <span className="text-lg font-bold text-white">WebVillage</span>
            </Link>
            <p className="max-w-md text-sm text-gray-400">
              AI agents + expert village for digital work at scale.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
            <a
              href="mailto:hello@webvillage.com"
              className="transition-colors hover:text-white"
            >
              hello@webvillage.com
            </a>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} WebVillage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
