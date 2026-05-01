import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
      <body className="font-sans">{children}</body>
    </html>
  )
}
