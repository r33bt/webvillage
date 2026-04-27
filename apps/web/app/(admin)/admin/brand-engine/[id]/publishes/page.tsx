import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface PubRow {
  id: string
  draft_id: string
  platforms: string[]
  status: string
  ayrshare_post_id: string | null
  scheduled_for: string | null
  published_at: string | null
  cancelled_at: string | null
  failure_reason: string | null
  parent_publish_id: string | null
  created_at: string
}

const STATUS_BADGE: Record<string, string> = {
  queued: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-50 text-slate-600 border-slate-200',
}

const STATUS_ICON: Record<string, string> = {
  queued: '⏰',
  pending: '⌛',
  scheduled: '⏰',
  published: '✓',
  failed: '✗',
  cancelled: '⊘',
}

export default async function PublishesListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { id } = await params
  const { status } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: cred }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_platform_credentials')
      .select('id, platform, external_workspace_id')
      .eq('client_id', id)
      .like('platform', 'ayrshare_%')
      .is('deleted_at', null)
      .maybeSingle(),
  ])

  if (!client) notFound()

  let q = sb
    .from('wv_be_publishes')
    .select('id, draft_id, platforms, status, ayrshare_post_id, scheduled_for, published_at, cancelled_at, failure_reason, parent_publish_id, created_at')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(100)
  if (status && ['queued', 'pending', 'published', 'failed', 'cancelled'].includes(status)) {
    q = q.eq('status', status)
  }

  const { data: publishes } = await q
  const rows = (publishes ?? []) as PubRow[]

  const counts = {
    queued: 0, pending: 0, published: 0, failed: 0, cancelled: 0, total: 0,
  }
  // Cheap: re-query counts (small table at alpha scale)
  const [
    { count: queuedCount }, { count: pendingCount }, { count: publishedCount }, { count: failedCount }, { count: cancelledCount }, { count: totalCount },
  ] = await Promise.all([
    sb.from('wv_be_publishes').select('*', { count: 'exact', head: true }).eq('client_id', id).eq('status', 'queued'),
    sb.from('wv_be_publishes').select('*', { count: 'exact', head: true }).eq('client_id', id).eq('status', 'pending'),
    sb.from('wv_be_publishes').select('*', { count: 'exact', head: true }).eq('client_id', id).eq('status', 'published'),
    sb.from('wv_be_publishes').select('*', { count: 'exact', head: true }).eq('client_id', id).eq('status', 'failed'),
    sb.from('wv_be_publishes').select('*', { count: 'exact', head: true }).eq('client_id', id).eq('status', 'cancelled'),
    sb.from('wv_be_publishes').select('*', { count: 'exact', head: true }).eq('client_id', id),
  ])
  counts.queued = queuedCount ?? 0
  counts.pending = pendingCount ?? 0
  counts.published = publishedCount ?? 0
  counts.failed = failedCount ?? 0
  counts.cancelled = cancelledCount ?? 0
  counts.total = totalCount ?? 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Publishes</p>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="text-sm text-[#6B7C79]">
            Ayrshare → LinkedIn. {counts.total} total · {counts.queued + counts.pending} in flight.
          </p>
        </div>
        {cred ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            ✓ Ayrshare connected
          </div>
        ) : (
          <Link
            href={`/admin/brand-engine/${id}/publishes/connect`}
            className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
          >
            Connect Ayrshare &rarr;
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip label="All" count={counts.total} active={!status} href={`/admin/brand-engine/${id}/publishes`} />
        <FilterChip label="Queued" count={counts.queued} active={status === 'queued'} href={`/admin/brand-engine/${id}/publishes?status=queued`} />
        <FilterChip label="Pending" count={counts.pending} active={status === 'pending'} href={`/admin/brand-engine/${id}/publishes?status=pending`} />
        <FilterChip label="Published" count={counts.published} active={status === 'published'} href={`/admin/brand-engine/${id}/publishes?status=published`} />
        <FilterChip label="Failed" count={counts.failed} active={status === 'failed'} href={`/admin/brand-engine/${id}/publishes?status=failed`} />
        <FilterChip label="Cancelled" count={counts.cancelled} active={status === 'cancelled'} href={`/admin/brand-engine/${id}/publishes?status=cancelled`} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {!cred ? (
            <>
              <p className="mb-2 font-semibold">Ayrshare not connected.</p>
              <p>Connect this brand's Ayrshare profile to enable publishing.</p>
            </>
          ) : (
            <>
              <p className="mb-2 font-semibold">No publishes match this filter.</p>
              <p>Pick an approved or edited draft and click "Publish now" or "Schedule".</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((p) => (
            <Link
              key={p.id}
              href={`/admin/brand-engine/${id}/publishes/${p.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#0F766E]/40 hover:bg-slate-50"
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[p.status] ?? 'bg-slate-50'}`}>
                    {STATUS_ICON[p.status] ?? '?'} {p.status}
                  </span>
                  <span className="font-mono text-xs text-[#6B7C79]">{p.platforms.join(', ')}</span>
                  {p.parent_publish_id && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">retry</span>
                  )}
                </div>
                <span className="text-xs text-[#6B7C79]">
                  {p.published_at
                    ? `Published ${new Date(p.published_at).toISOString().slice(0, 16).replace('T', ' ')}`
                    : p.scheduled_for
                      ? `Scheduled ${new Date(p.scheduled_for).toISOString().slice(0, 16).replace('T', ' ')}`
                      : `Created ${new Date(p.created_at).toISOString().slice(0, 16).replace('T', ' ')}`}
                </span>
              </div>
              {p.failure_reason && <p className="line-clamp-1 text-xs text-red-700">⚠ {p.failure_reason}</p>}
              <p className="font-mono text-xs text-[#6B7C79]">draft: {p.draft_id.slice(0, 8)}{p.ayrshare_post_id ? ` · ayr: ${p.ayrshare_post_id.slice(0, 12)}` : ''}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, count, active, href }: { label: string; count: number; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'border-[#0F766E] bg-[#0F766E] text-white' : 'border-slate-300 bg-white text-[#6B7C79] hover:border-slate-400'
      }`}
    >
      {label} <span className={active ? 'text-white/80' : 'text-[#6B7C79]'}>({count})</span>
    </Link>
  )
}
