import type { Metadata } from 'next'
import CountryPage from '@/components/CountryPage'

export const metadata: Metadata = {
  title: 'Find Sales Training Providers in the United States',
  description:
    'Find top sales training providers in the US, including Sandler franchises and Training Industry-listed companies. Browse by category or delivery method.',
  alternates: { canonical: 'https://findtraining.com/us' },
  openGraph: {
    url: 'https://findtraining.com/us',
    title: 'Find Sales Training Providers in the US — FindTraining.com',
    description: 'Browse top US sales training organisations, Sandler franchises, and professional development providers.',
  },
}

export default function USPage() {
  return <CountryPage countryCode="US" />
}
