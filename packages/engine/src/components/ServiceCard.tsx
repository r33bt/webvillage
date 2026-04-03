'use client'

import { DirectoryCard } from './DirectoryCard'

export function ServiceCard({ service }: { service: any }) {
  return <DirectoryCard business={{ ...service, _type: 'service' }} />
}
