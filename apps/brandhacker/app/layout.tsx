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
    'The source of truth for your brand. Upload once. Your team, your AI, your social, your web — all stay on-brand by default.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BrandHacker — One brand. Every surface.',
    description:
      'The source of truth for your brand. Upload once. Your team, your AI, your social, your web — all stay on-brand by default.',
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
