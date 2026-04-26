import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member directory pricing — Self-serve and managed tiers',
  description:
    'Member directory pricing for chambers of commerce, regional associations, industry bodies, and agencies. Self-serve from $0/mo · managed from $2,500 setup + $299/mo · enterprise white-label from $10K+.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
