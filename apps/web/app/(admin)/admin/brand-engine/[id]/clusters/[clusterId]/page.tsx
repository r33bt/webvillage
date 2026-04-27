import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { fetchSlotsWithRollup, computeClusterRollup } from '@/lib/be-cluster-rollup'
import { estimateClusterCostCents, CLUSTER_COST_SOFT_WARNING_CENTS } from '@/lib/be-cluster-cost'
import { generateCluster } from './actions'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700 border-slate-200',
  generating: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  archived: 'bg-slate-50 text-slate-500 border-slate-200',
}

const SLOT_STATUS_BADGE: Record<string, string> = {
  empty: 'bg-slate-100 text-slate-700',
  planned: 'bg-amber-50 text-amber-700',
  generating: 'bg-blue-50 text-blue-700',
  drafted: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  scheduled: 'bg-indigo-50 text-indigo-700',
  published: 'bg-purple-50 text-purple-700',
}

function bandClass(avg: number | null): string {
  if (avg === null) return 'bg-slate-100 text-slate-600'
  if (avg >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (avg >= 70) return 'bg-amber-50 text-amber-700 border-amber-200'
  if (avg >= 60) return 'bg-orange-50 text-orange-700 border-orange-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

export default async function ClusterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; clusterId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id, clusterId } = await params
  const { error: errorParam } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: cluster }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb.from('wv_be_clusters').select('*').eq('id', clusterId).is('deleted_at', null).maybeSingle(),
  ])

  if (!client || !cluster) notFound()

  const slots = await fetchSlotsWithRollup(clusterId)
  const rollup = await computeClusterRollup(clusterId, slots)

  const { data: latestJob } = await sb
    .from('wv_be_jobs')
    .select('id, status, progress, last_error, created_at')
    .eq('job_type', 'cluster_generate')
    .filter('payload->>cluster_id', 'eq', clusterId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isActiveJob = latestJob && ['pending', 'processing'].includes(latestJob.status as string)
  const estimatedCostCents = estimateClusterCostCents(cluster.total_slots as number)
  const needsCostConfirm = estimatedCostCents > CLUSTER_COST_SOFT_WARNING_CENTS
  const firstFailedOrPlanned = slots.find((s) => s.status === 'failed' || s.status === 'planned')

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/clusters`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; All clusters
      </Link>

      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Cluster</p>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{cluster.name}</h1>
          <p className="font-mono text-xs text-[#6B7C79]">{cluster.id}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGE[cluster.status as string] ?? 'bg-slate-50'}`}>
          {cluster.status}
        </span>
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-1 font-semibold">Last action failed</p>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
        </div>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Meta</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Theme" value={cluster.theme as string} />
          <Field label="Audience" value={cluster.target_audience as string} />
          <Field label="Arc type" value={(cluster.arc_type as string) ?? 'free-form'} />
          <Field label="Total slots" value={String(cluster.total_slots)} />
          <Field
            label="Generation started"
            value={cluster.generation_started_at ? new Date(cluster.generation_started_at as string).toISOString().slice(0, 19).replace('T', ' ') : '—'}
          />
          <Field
            label="Generation completed"
            value={cluster.generation_completed_at ? new Date(cluster.generation_completed_at as string).toISOString().slice(0, 19).replace('T', ' ') : '—'}
          />
        </dl>
      </section>

      {/* Action bar — generate / resume */}
      {(cluster.status === 'planning' || cluster.status === 'paused' || cluster.status === 'completed') && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Generate</h2>
          <form action={generateCluster} className="space-y-3">
            <input type="hidden" name="client_id" value={id} />
            <input type="hidden" name="cluster_id" value={clusterId} />
            {cluster.status === 'paused' && firstFailedOrPlanned && (
              <input type="hidden" name="start_from_slot_index" value={firstFailedOrPlanned.slot_index} />
            )}
            {cluster.status === 'completed' && <input type="hidden" name="force" value="true" />}
            {needsCostConfirm && <input type="hidden" name="confirm_cost_cents" value={estimatedCostCents} />}
            <p className="text-sm text-[#6B7C79]">
              Estimated cost: <span className="font-mono text-[#1C2B28]">${(estimatedCostCents / 100).toFixed(2)}</span>
              {needsCostConfirm && <span className="ml-2 text-amber-700">⚠ above 50¢ soft warning — submission auto-confirms</span>}
              {cluster.status === 'paused' && firstFailedOrPlanned && (
                <span className="ml-2 text-amber-700">↻ resuming from slot {firstFailedOrPlanned.slot_index}</span>
              )}
              {cluster.status === 'completed' && <span className="ml-2 text-blue-700">↻ re-fire (creates new draft rows with parent_draft_id chain)</span>}
            </p>
            <button type="submit" className="rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d655d]">
              {cluster.status === 'paused' ? 'Resume cluster' : cluster.status === 'completed' ? 'Re-fire cluster' : 'Generate cluster'}
            </button>
          </form>
        </section>
      )}

      {isActiveJob && (
        <section className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-800">Generation in progress</h2>
          <p className="text-sm text-blue-900">
            Job <span className="font-mono text-xs">{latestJob!.id.slice(0, 8)}</span> is {latestJob!.status}.
            {latestJob!.progress &&
              typeof (latestJob!.progress as { current_slot?: number; total_slots?: number }).current_slot === 'number' && (
                <span> Currently on slot {String((latestJob!.progress as { current_slot: number }).current_slot)} of{' '}
                  {String((latestJob!.progress as { total_slots: number }).total_slots)}.</span>
              )}
            {' '}Cron tick fires every 1 min; refresh this page to see progress.
          </p>
        </section>
      )}

      {/* Slot grid */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Slots</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Topic</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Arc</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Score</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Banned</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {slots.map((s) => (
                <tr key={s.slot_index}>
                  <td className="px-3 py-2.5 font-mono text-xs text-[#6B7C79]">{s.slot_index}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-[#1C2B28]">{s.slot_topic}</div>
                    <div className="line-clamp-1 text-xs text-[#6B7C79]">{s.slot_brief}</div>
                    {s.last_error && <div className="mt-1 text-xs text-red-700">⚠ {s.last_error.slice(0, 100)}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#6B7C79]">{s.slot_arc_role ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SLOT_STATUS_BADGE[s.status] ?? 'bg-slate-100'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {s.draft_score_average !== null ? (
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${bandClass(s.draft_score_average)}`}>
                        {s.draft_score_average.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B7C79]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {(s.draft_banned_phrase_hits?.length ?? 0) > 0 ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                        {s.draft_banned_phrase_hits!.length}
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B7C79]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {s.draft_id ? (
                      <Link
                        href={`/admin/brand-engine/${id}/drafts/${s.draft_id}`}
                        className="text-xs font-medium text-[#0F766E] hover:underline"
                      >
                        Open draft &rarr;
                      </Link>
                    ) : (
                      <span className="text-xs text-[#6B7C79]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rollup */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Cluster rollup</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Average score</p>
            <p className="text-3xl font-bold text-[#0F766E]">{rollup.avg_score !== null ? rollup.avg_score.toFixed(1) : '—'}</p>
            <p className="text-xs text-[#6B7C79]">
              {rollup.slots_drafted} drafted · {rollup.slots_failed} failed · {rollup.slots_pending} pending
            </p>
            <p className="mt-2 text-xs text-[#6B7C79]">
              Total cost so far: <span className="font-mono text-[#1C2B28]">${(rollup.total_cost_cents / 100).toFixed(3)}</span>
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Per-pillar averages</p>
            <div className="space-y-1">
              <PillarMini label="Provenance" v={rollup.avg_per_pillar.provenance} />
              <PillarMini label="Specificity" v={rollup.avg_per_pillar.specificity} />
              <PillarMini label="Structure" v={rollup.avg_per_pillar.structure} />
              <PillarMini label="Voice" v={rollup.avg_per_pillar.voice} />
              <PillarMini label="Utility" v={rollup.avg_per_pillar.utility} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">{label}</dt>
      <dd className="mt-0.5 text-[#1C2B28]">{value}</dd>
    </div>
  )
}

function PillarMini({ label, v }: { label: string; v: number | null }) {
  if (v === null) {
    return (
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-[#6B7C79]">{label}</span>
        <span className="text-[#6B7C79]">—</span>
      </div>
    )
  }
  const color = v >= 85 ? 'bg-emerald-500' : v >= 70 ? 'bg-amber-500' : v >= 60 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-[#6B7C79]">{label}</span>
        <span className="font-mono text-[#1C2B28]">{v.toFixed(0)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, v))}%` }} />
      </div>
    </div>
  )
}
