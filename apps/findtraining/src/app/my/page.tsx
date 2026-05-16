import type { Metadata } from 'next'
import CountryPage from '@/components/CountryPage'

export const metadata: Metadata = {
  title: 'Find HRDF-Registered Training Providers in Malaysia',
  description:
    'Find HRDF-registered training providers in Malaysia. Search thousands of providers by category and state. Calculate your HRD Corp levy and find levy-claimable training courses.',
  alternates: { canonical: 'https://findtraining.com/my' },
  openGraph: {
    url: 'https://findtraining.com/my',
    title: 'Find HRDF Training Providers in Malaysia — FindTraining.com',
    description: 'Browse Malaysia\'s most complete HRDF-registered training provider directory.',
    locale: 'en_MY',
  },
}

export default function MalaysiaPage() {
  return <CountryPage countryCode="MY" />
}
