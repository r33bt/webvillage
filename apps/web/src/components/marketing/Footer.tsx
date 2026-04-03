import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export function Footer() {
  return (
    <footer className="bg-[#0C1A18] px-4 py-10">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" variant="light" />
          <span className="text-lg font-bold text-white">WebVillage</span>
        </Link>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
          <a href="#embed" className="transition-colors hover:text-white">Embed</a>
          <a href="mailto:hello@webvillage.com" className="transition-colors hover:text-white">hello@webvillage.com</a>
        </nav>

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} WebVillage
        </p>
      </div>
    </footer>
  )
}
