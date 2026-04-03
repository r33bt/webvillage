'use client'

import { DirectoryCard } from './DirectoryCard'

export function ProviderCard({ provider }: { provider: any }) {
  return <DirectoryCard business={{ ...provider, _type: 'provider' }} />
}
