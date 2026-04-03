import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'FindTraining — Corporate Training Providers in Malaysia',
    template: '%s | FindTraining',
  },
  description: 'Find the best corporate training providers in Malaysia. Browse HRDF-claimable courses, certifications, and professional development programs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
