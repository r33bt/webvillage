'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#embed', label: 'WordPress & Embed' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Logo
              className="h-9 w-9"
              variant={scrolled ? 'default' : 'light'}
            />
            <span
              className={`text-lg font-bold transition-colors ${
                scrolled ? 'text-[#1C2B28]' : 'text-white'
              }`}
            >
              WebVillage
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  scrolled
                    ? 'text-[#6B7C79] hover:text-[#1C2B28]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex">
            <Link
              href="/contact"
              className="rounded-lg bg-[#D97706] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#B45309]"
            >
              Book a demo →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`p-2 md:hidden ${scrolled ? 'text-[#1C2B28]' : 'text-white'}`}
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
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xl md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-4 py-3 font-medium text-[#1C2B28] transition-colors hover:bg-[#F0FAF9]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <Link
                  href="/contact"
                  className="block rounded-lg bg-[#D97706] px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-[#B45309]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book a demo →
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
