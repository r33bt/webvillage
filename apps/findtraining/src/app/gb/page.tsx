import type { Metadata } from 'next'
import CountryPage from '@/components/CountryPage'

export const metadata: Metadata = {
  title: 'Find Sales Training Providers in the United Kingdom',
  description:
    'Find ISP-accredited and apprenticeship-approved sales training providers in the UK. Browse providers eligible for Apprenticeship Levy funding across England, Scotland, Wales, and Northern Ireland.',
  alternates: { canonical: 'https://findtraining.com/gb' },
  openGraph: {
    url: 'https://findtraining.com/gb',
    title: 'Find Sales Training Providers in the UK — FindTraining.com',
    description: 'Browse ISP-accredited and Apprenticeship Levy-eligible sales training providers in the UK.',
  },
}

export default function UKPage() {
  return <CountryPage countryCode="GB" />
}
