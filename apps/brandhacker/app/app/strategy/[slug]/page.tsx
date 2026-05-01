import { notFound } from 'next/navigation'
import { getServiceRoleClient, type ClientMetadata } from '@/lib/supabase'
import { StrategyClient } from './StrategyClient'
import type { ContentPillarsMetadata } from '@/api/be/strategy/generate/route'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function StrategyPage({ params }: PageProps) {
  const { slug } = await params

  const sb = getServiceRoleClient()

  const { data: client } = await sb
    .from('wv_be_clients')
    .select('id, display_name, current_tier, metadata')
    .eq('metadata->>slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (!client) notFound()

  const meta = (client.metadata ?? {}) as ClientMetadata
  const existing = (meta.content_pillars as ContentPillarsMetadata | undefined) ?? null

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Content strategy</p>
        <h1 className="text-2xl font-semibold text-zinc-50">{client.display_name}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{client.current_tier} · {slug}</p>
      </div>

      <StrategyClient
        slug={slug}
        clientId={client.id}
        existing={existing}
      />
    </div>
  )
}
