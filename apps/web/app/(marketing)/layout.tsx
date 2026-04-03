import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: {
    default: 'WebVillage — Member directories, done for you',
    template: '%s | WebVillage',
  },
  description:
    'WebVillage powers member directories for associations, chambers of commerce, and industry bodies. Done-for-you managed service + self-serve embed for any website.',
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
