'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/templates', label: 'Templates' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <span className="text-xl font-bold text-blue-600">W</span>
            </div>
            <span className="text-xl font-bold text-white">WebVillage</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/founding-members"
              className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-bold text-blue-900 transition-colors hover:bg-yellow-300"
            >
              <span>⭐</span>
              Founding Member
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="font-medium text-white/90 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-white px-5 py-2.5 font-semibold text-blue-600 transition-colors hover:bg-gray-100"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-lg md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/founding-members"
                className="rounded-lg px-4 py-2 font-medium text-yellow-400 transition-colors hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                ⭐ Founding Member
              </Link>
              <hr className="border-white/20" />
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-4 py-2 text-center font-semibold text-blue-600 transition-colors hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
