import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ClusterRow {
  id: string
  name: string
  theme: string
  target_audience: string
  arc_type: string | null
  total_slots: number
  status: string
  created_at: string
  generation_started_at: string | null
  generation_completed_at: string | null
}

const STATUS_BADGE: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700 border-slate-200',
  generating: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  archived: 'bg-slate-50 text-slate-500 border-slate-200',
}

export default async function ClustersListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: clusters }, { data: slotCounts }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_clusters')
      .select('id, name, theme, target_audience, arc_type, total_slots, status, created_at, generation_started_at, generation_completed_at')
      .eq('client_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),
    sb
      .from('wv_be_cluster_slots')
      .select('cluster_id, status')
      .in('cluster_id', []),  // placeholder; replaced below
  ])

  if (!client) notFound()

  // Fetch slot status counts per cluster
  const clusterIds = (clusters ?? []).map((c) => c.id as string)
  let slotsByCluster = new Map<string, { drafted: number; failed: number; total: number }>()
  if (clusterIds.length > 0) {
    const { data: slots } = await sb
      .from('wv_be_cluster_slots')
      .select('cluster_id, status')
      .in('cluster_id', clusterIds)
    for (const s of slots ?? []) {
      const cid = s.cluster_id as string
      if (!slotsByCluster.has(cid)) slotsByCluster.set(cid, { drafted: 0, failed: 0, total: 0 })
      const counts = slotsByCluster.get(cid)!
      counts.total += 1
      if (s.status === 'drafted') counts.drafted += 1
      if (s.status === 'failed') counts.failed += 1
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Topic clusters</p>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="text-sm text-[#6B7C79]">
            {clusters?.length ?? 0} cluster{(clusters?.length ?? 0) === 1 ? '' : 's'} · sequential generation, peer-aware drafts
          </p>
        </div>
        <Link
          href={`/admin/brand-engine/${id}/clusters/new`}
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
        >
          + New cluster
        </Link>
      </div>

      {(clusters?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="mb-2 font-semibold">No clusters yet.</p>
          <p>A cluster groups multiple drafts under a shared theme. Each slot becomes a draft via Slice 3 with peer titles injected as context (sibling-aware).</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {((clusters ?? []) as ClusterRow[]).map((c) => {
            const counts = slotsByCluster.get(c.id) ?? { drafted: 0, failed: 0, total: c.total_slots }
            const pct = counts.total > 0 ? Math.round((counts.drafted / counts.total) * 100) : 0
            return (
              <Link
                key={c.id}
                href={`/admin/brand-engine/${id}/clusters/${c.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#0F766E]/40 hover:bg-slate-50"
              >
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-[#1C2B28] line-clamp-1">{c.name}</h2>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[c.status] ?? 'bg-slate-50'}`}>
                    {c.status}
                  </span>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-[#6B7C79]">{c.theme}</p>
                <div className="mb-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[#6B7C79]">{counts.drafted} / {counts.total} drafted{counts.failed > 0 ? ` · ${counts.failed} failed` : ''}</span>
                    <span className="font-mono text-[#0F766E]">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={counts.failed > 0 ? 'h-full bg-amber-500' : 'h-full bg-emerald-500'} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <p className="text-xs text-[#6B7C79]">
                  {c.arc_type ?? 'free-form'} · {c.total_slots} slots · created {new Date(c.created_at).toISOString().slice(0, 10)}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
