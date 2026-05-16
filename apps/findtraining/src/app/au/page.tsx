import type { Metadata } from 'next'
import CountryPage from '@/components/CountryPage'

export const metadata: Metadata = {
  title: 'Find Training Providers in Australia — ASQA Registered RTOs',
  description:
    'Find ASQA-registered training organisations (RTOs) and accredited professional development providers across Australia. Verify RTO registration before enrolling.',
  alternates: { canonical: 'https://findtraining.com/au' },
  openGraph: {
    url: 'https://findtraining.com/au',
    title: 'Find Training Providers in Australia — FindTraining.com',
    description: 'Browse ASQA-registered RTOs and accredited training providers across Australia.',
  },
}

export default function AustraliaPage() {
  return <CountryPage countryCode="AU" />
}
