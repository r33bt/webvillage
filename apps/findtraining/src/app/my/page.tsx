import type { Metadata } from 'next'
import CountryPage from '@/components/CountryPage'

export const metadata: Metadata = {
  title: 'Find HRDF-Registered Training Providers in Malaysia',
  description:
    'Find training providers in Malaysia by category and state, and calculate your HRD Corp levy.',
  alternates: { canonical: 'https://findtraining.com/my' },
  openGraph: {
    url: 'https://findtraining.com/my',
    title: 'Find HRDF Training Providers in Malaysia — FindTraining.com',
    description: 'Browse training providers in Malaysia by category and state.',
    locale: 'en_MY',
  },
}

export default function MalaysiaPage() {
  return <CountryPage countryCode="MY" />
}
