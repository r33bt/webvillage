import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface InboxRow {
  id: string
  vista_event_id: string
  event_type: string
  source_handle: string | null
  source_display_name: string | null
  source_excerpt: string | null
  received_at: string
  occurred_at: string | null
  reply_sent_at: string | null
  dismissed_at: string | null
  reply_draft_id: string | null
  send_failure_reason: string | null
}

const EVENT_TYPE_BADGE: Record<string, string> = {
  mention: 'bg-blue-50 text-blue-700 border-blue-200',
  dm: 'bg-purple-50 text-purple-700 border-purple-200',
  comment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reaction: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default async function InboxListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ filter?: string; connected?: string }>
}) {
  const { id } = await params
  const { filter = 'unread', connected } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: cred }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_platform_credentials')
      .select('id, scope, oauth_expires_at, last_refreshed_at, external_workspace_id')
      .eq('client_id', id)
      .eq('platform', 'vista_linkedin')
      .is('deleted_at', null)
      .maybeSingle(),
  ])

  if (!client) notFound()

  let q = sb
    .from('wv_be_inbox_events')
    .select('id, vista_event_id, event_type, source_handle, source_display_name, source_excerpt, received_at, occurred_at, reply_sent_at, dismissed_at, reply_draft_id, send_failure_reason')
    .eq('client_id', id)
    .order('received_at', { ascending: false })
    .limit(100)

  if (filter === 'unread') q = q.is('reply_sent_at', null).is('dismissed_at', null)
  else if (filter === 'replied') q = q.not('reply_sent_at', 'is', null)
  else if (filter === 'dismissed') q = q.not('dismissed_at', 'is', null)

  const { data: events } = await q
  const rows = (events ?? []) as InboxRow[]

  // Counts for filter chips
  const [{ count: unreadCount }, { count: repliedCount }, { count: dismissedCount }, { count: totalCount }] = await Promise.all([
    sb.from('wv_be_inbox_events').select('*', { count: 'exact', head: true }).eq('client_id', id).is('reply_sent_at', null).is('dismissed_at', null),
    sb.from('wv_be_inbox_events').select('*', { count: 'exact', head: true }).eq('client_id', id).not('reply_sent_at', 'is', null),
    sb.from('wv_be_inbox_events').select('*', { count: 'exact', head: true }).eq('client_id', id).not('dismissed_at', 'is', null),
    sb.from('wv_be_inbox_events').select('*', { count: 'exact', head: true }).eq('client_id', id),
  ])

  const isConnected = !!cred

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Inbox</p>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="text-sm text-[#6B7C79]">
            Vista Social — LinkedIn mentions, DMs, comments. AI-drafted reply variants per event.
          </p>
        </div>
        {isConnected ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            ✓ Vista connected · expires{' '}
            {cred!.oauth_expires_at ? new Date(cred!.oauth_expires_at as string).toISOString().slice(0, 10) : '—'}
          </div>
        ) : (
          <Link
            href={`/admin/brand-engine/${id}/inbox/connect`}
            className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
          >
            Connect Vista &rarr;
          </Link>
        )}
      </div>

      {connected === 'vista' && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Vista connected successfully. Webhooks will start arriving for new LinkedIn engagement.
        </div>
      )}

      <div className="mb-6 flex items-center gap-2">
        <FilterChip label="Unread" count={unreadCount ?? 0} active={filter === 'unread'} href={`/admin/brand-engine/${id}/inbox?filter=unread`} />
        <FilterChip label="Replied" count={repliedCount ?? 0} active={filter === 'replied'} href={`/admin/brand-engine/${id}/inbox?filter=replied`} />
        <FilterChip label="Dismissed" count={dismissedCount ?? 0} active={filter === 'dismissed'} href={`/admin/brand-engine/${id}/inbox?filter=dismissed`} />
        <FilterChip label="All" count={totalCount ?? 0} active={filter === 'all'} href={`/admin/brand-engine/${id}/inbox?filter=all`} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {!isConnected ? (
            <>
              <p className="mb-2 font-semibold">Vista not connected.</p>
              <p>Connect Vista Social for this brand to start receiving LinkedIn engagement events.</p>
            </>
          ) : (
            <>
              <p className="mb-2 font-semibold">No events match this filter.</p>
              <p>Webhooks fire on new LinkedIn mentions/DMs/comments to the connected workspace.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((e) => (
            <Link
              key={e.id}
              href={`/admin/brand-engine/${id}/inbox/${e.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#0F766E]/40 hover:bg-slate-50"
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${EVENT_TYPE_BADGE[e.event_type] ?? 'bg-slate-50'}`}>
                    {e.event_type}
                  </span>
                  <span className="font-medium text-[#1C2B28]">{e.source_display_name ?? e.source_handle ?? 'unknown'}</span>
                  {e.source_handle && <span className="font-mono text-xs text-[#6B7C79]">{e.source_handle}</span>}
                  {e.reply_sent_at && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">replied</span>
                  )}
                  {e.dismissed_at && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">dismissed</span>
                  )}
                  {e.send_failure_reason && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700">send failed</span>
                  )}
                </div>
                <span className="text-xs text-[#6B7C79]">{new Date(e.received_at).toISOString().slice(0, 16).replace('T', ' ')}</span>
              </div>
              {e.source_excerpt && <p className="line-clamp-2 text-sm text-[#1C2B28]">{e.source_excerpt}</p>}
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
