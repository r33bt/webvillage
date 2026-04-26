import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: {
    default: 'WebVillage — AI agents + expert village for digital work at scale',
    template: '%s | WebVillage',
  },
  description:
    'WebVillage is a hybrid AI + expert platform. AI agents handle volume — content, SEO, code, ops, monitoring. A vetted village of subject-matter experts handles work that needs taste. Six layers, fourteen verticals.',
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
