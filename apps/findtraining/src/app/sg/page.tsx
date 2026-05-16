import type { Metadata } from 'next'
import CountryPage from '@/components/CountryPage'

export const metadata: Metadata = {
  title: 'Find Training Providers in Singapore — SkillsFuture Eligible',
  description:
    'Find SkillsFuture-eligible training providers in Singapore. Browse accredited courses and professional development programmes from SSG-approved providers.',
  alternates: { canonical: 'https://findtraining.com/sg' },
  openGraph: {
    url: 'https://findtraining.com/sg',
    title: 'Find Training Providers in Singapore — FindTraining.com',
    description: 'Browse SkillsFuture-eligible training providers in Singapore.',
  },
}

export default function SingaporePage() {
  return <CountryPage countryCode="SG" />
}
