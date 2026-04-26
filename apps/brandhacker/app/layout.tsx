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
  title: 'BrandHacker — coming soon',
  description: 'The source of truth for your brand. Coming soon.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'BrandHacker',
    description: 'The source of truth for your brand. Coming soon.',
    type: 'website',
    url: 'https://brandhacker.com',
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
