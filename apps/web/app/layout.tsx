import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { JsonLd } from '@/components/JsonLd'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webvillage.com'
  ),
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WebVillage',
  url: 'https://webvillage.com',
  logo: 'https://webvillage.com/favicon.ico',
  description:
    'AI agents and an expert village for digital work at scale. Content, SEO, code, design, ops — AI handles volume, vetted experts handle judgment.',
  foundingDate: '2025',
  areaServed: 'Worldwide',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'hello@webvillage.com',
  },
  sameAs: [],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <JsonLd data={organizationSchema} />
        {children}
      </body>
    </html>
  )
}
