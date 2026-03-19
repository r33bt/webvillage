import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: {
    default: 'WebVillage — Stop paying for 5 tools. Start with one.',
    template: '%s | WebVillage',
  },
  description:
    'Website, bookings, link-in-bio, custom domain, and email — all in one platform. Starting at $9/mo.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
