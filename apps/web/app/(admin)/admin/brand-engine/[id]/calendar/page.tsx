import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { getLookerCalendarConfig, buildLookerCalendarEmbedUrl } from '@/lib/looker-config'
import { refreshCalendar } from './actions'

export const dynamic = 'force-dynamic'

interface AuditRow {
  occurred_at: string
  after_state: { refreshed_at?: string; duration_ms?: number; rows_in_view?: number; trigger_source?: string }
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; refreshed?: string }>
}) {
  const { id } = await params
  const { error: errorParam, refreshed } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: lastRefresh }, { count: rowCount }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_audit_log')
      .select('occurred_at, after_state')
      .eq('action', 'calendar_refresh_triggered')
      .eq('client_id', id)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb.from('wv_be_mv_editorial_calendar').select('*', { count: 'exact', head: true }).eq('client_id', id),
  ])

  if (!client) notFound()

  const lookerCfg = getLookerCalendarConfig()
  const embedUrl = lookerCfg.isConfigured ? buildLookerCalendarEmbedUrl(id) : null
  const lastManualRefresh = (lastRefresh as AuditRow | null)?.after_state?.refreshed_at ?? null

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Editorial calendar</p>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="text-sm text-[#6B7C79]">
            {rowCount ?? 0} draft{rowCount === 1 ? '' : 's'} in 180-day window · auto-refresh every 15 min · Looker Studio iframe
          </p>
        </div>
        <form action={refreshCalendar}>
          <input type="hidden" name="client_id" value={id} />
          <button
            type="submit"
            className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
          >
            Refresh now
          </button>
        </form>
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-1 font-semibold">Refresh failed</p>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
        </div>
      )}

      {refreshed && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Calendar refreshed.
        </div>
      )}

      {!lookerCfg.isConfigured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="mb-2 font-semibold">Looker Studio not configured.</p>
          <p>The materialized view + RPC + reader role are deployed; founder action is the Looker Studio side:</p>
          <ol className="mt-2 list-decimal pl-5 space-y-1">
            <li>Sign in to <span className="font-mono text-xs">lookerstudio.google.com</span> (massiveniche@gmail.com)</li>
            <li>New blank report → Add data → PostgreSQL connector</li>
            <li>Connection: <span className="font-mono text-xs">db.hzqbsixlintiairmabbg.supabase.co:5432</span> · DB <span className="font-mono text-xs">postgres</span> · User <span className="font-mono text-xs">wv_calendar_reader</span> · password (set via Supabase dashboard → Settings → Database → set password for the role; store as 1Password "Looker Calendar Reader (EVA Platform)")</li>
            <li>Custom SQL initial query: <span className="font-mono text-xs">SET LOCAL app.current_client = @client_id; SELECT * FROM wv_be_v_editorial_calendar;</span></li>
            <li>Add Studio parameter <span className="font-mono text-xs">client_id</span> (UUID, default empty)</li>
            <li>Build 3 pages: Timeline (calendar_date × routing_band), Table (all cols filterable), Per-band breakdown (4 score-card tiles)</li>
            <li>Share → Anyone with link can view</li>
            <li>Get embed URL → extract REPORT_ID + PAGE_ID</li>
            <li>Set Vercel env vars <span className="font-mono text-xs">LOOKER_CALENDAR_REPORT_ID</span> + <span className="font-mono text-xs">LOOKER_CALENDAR_PAGE_ID</span></li>
            <li>Reload this page; iframe will render</li>
          </ol>
          <p className="mt-3 text-xs text-amber-700">
            Per spec §Q9-1 → free Looker Studio is sufficient for V0 scale; revisit paid Looker only at Stage 3 multi-tenant white-label.
          </p>
        </div>
      ) : embedUrl ? (
        <>
          <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <iframe
              src={embedUrl}
              width="100%"
              height="900"
              frameBorder="0"
              allowFullScreen
              title={`${client.display_name} editorial calendar`}
            />
          </div>
          <p className="text-center text-xs text-[#6B7C79]">
            Refreshes every 15 min via Vercel cron + on-publish from Slice 8 webhook.
            {lastManualRefresh && (
              <>
                {' '}Last manual refresh: <span className="font-mono">{new Date(lastManualRefresh).toISOString().slice(0, 19).replace('T', ' ')}</span>
              </>
            )}
          </p>
        </>
      ) : null}
    </div>
  )
}
