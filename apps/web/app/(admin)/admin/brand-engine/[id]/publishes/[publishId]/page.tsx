import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { cancelPublish, reschedulePublish, retryPublish } from './actions'

export const dynamic = 'force-dynamic'

interface PubRow {
  id: string
  draft_id: string
  client_id: string
  platforms: string[]
  status: string
  ayrshare_post_id: string | null
  scheduled_for: string | null
  published_at: string | null
  cancelled_at: string | null
  failure_reason: string | null
  parent_publish_id: string | null
  retry_count: number
  metadata: Record<string, unknown>
  response_payload: Record<string, unknown> | null
  created_at: string
}

interface AuditRow {
  action: string
  after_state: Record<string, unknown>
  actor_type: string
  occurred_at: string
}

const STATUS_BADGE: Record<string, string> = {
  queued: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-50 text-slate-600 border-slate-200',
}

export default async function PublishDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; publishId: string }>
  searchParams: Promise<{ error?: string; cancelled?: string; rescheduled?: string }>
}) {
  const { id, publishId } = await params
  const { error: errorParam, cancelled, rescheduled } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: pub }, { data: audits }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb.from('wv_be_publishes').select('*').eq('id', publishId).maybeSingle(),
    sb
      .from('wv_be_audit_log')
      .select('action, after_state, actor_type, occurred_at')
      .eq('target_table', 'wv_be_publishes')
      .eq('target_id', publishId)
      .order('occurred_at', { ascending: true }),
  ])

  if (!client || !pub) notFound()
  const p = pub as PubRow

  // Fetch draft excerpt
  const { data: draft } = await sb
    .from('wv_be_drafts')
    .select('id, draft_body, status')
    .eq('id', p.draft_id)
    .maybeSingle()

  // Walk parent chain
  const retryHistory: Array<{ id: string; status: string; failure_reason: string | null; created_at: string }> = []
  let curr = p.parent_publish_id
  while (curr && retryHistory.length < 10) {
    const { data: parent } = await sb
      .from('wv_be_publishes')
      .select('id, status, failure_reason, created_at, parent_publish_id')
      .eq('id', curr)
      .maybeSingle()
    if (!parent) break
    retryHistory.push({
      id: parent.id as string,
      status: parent.status as string,
      failure_reason: parent.failure_reason as string | null,
      created_at: parent.created_at as string,
    })
    curr = parent.parent_publish_id as string | null
  }

  const perPlatformStatus = (p.metadata?.per_platform_status ?? {}) as Record<string, { status: string; external_url?: string; error_message?: string }>
  const canCancel = p.status === 'queued' && p.scheduled_for && new Date(p.scheduled_for).getTime() > Date.now() + 60_000
  const canReschedule = p.status === 'queued' && p.scheduled_for && new Date(p.scheduled_for).getTime() > Date.now() + 60_000
  const canRetry = p.status === 'failed'

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/publishes`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; All publishes
      </Link>

      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Publish</p>
          <h1 className="text-xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="font-mono text-xs text-[#6B7C79]">{p.id}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGE[p.status] ?? 'bg-slate-50'}`}>
          {p.status}
        </span>
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-1 font-semibold">Last action failed</p>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
        </div>
      )}

      {cancelled && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Publish cancelled.</div>}
      {rescheduled && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Rescheduled.</div>}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Meta</h2>
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <Field label="Platforms" value={p.platforms.join(', ')} />
          <Field label="Status" value={p.status} />
          <Field label="Created" value={new Date(p.created_at).toISOString().slice(0, 19).replace('T', ' ')} />
          <Field label="Scheduled for" value={p.scheduled_for ? new Date(p.scheduled_for).toISOString().slice(0, 19).replace('T', ' ') : '—'} />
          <Field label="Published at" value={p.published_at ? new Date(p.published_at).toISOString().slice(0, 19).replace('T', ' ') : '—'} />
          <Field label="Cancelled at" value={p.cancelled_at ? new Date(p.cancelled_at).toISOString().slice(0, 19).replace('T', ' ') : '—'} />
          <Field label="Ayrshare post ID" value={p.ayrshare_post_id ?? '—'} />
          <Field label="Retry count" value={String(p.retry_count)} />
        </dl>
        {p.failure_reason && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <p className="font-semibold">Failure reason</p>
            <p className="mt-1 whitespace-pre-wrap text-xs">{p.failure_reason}</p>
          </div>
        )}
      </section>

      {Object.keys(perPlatformStatus).length > 0 && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Per-platform status</h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(perPlatformStatus).map(([platform, s]) => (
              <li key={platform} className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs text-[#6B7C79]">{platform}</span>
                <span className={s.status === 'success' ? 'text-emerald-700' : 'text-red-700'}>
                  {s.status}
                  {s.external_url && (
                    <a href={s.external_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#0F766E] hover:underline">
                      View →
                    </a>
                  )}
                  {s.error_message && <span className="ml-2 text-xs">{s.error_message}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action bar */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Actions</h2>
        <div className="flex flex-wrap items-center gap-3">
          {canCancel && (
            <form action={cancelPublish} className="flex items-center gap-2">
              <input type="hidden" name="client_id" value={id} />
              <input type="hidden" name="publish_id" value={p.id} />
              <input
                name="reason"
                placeholder="Cancel reason (optional)"
                className="form-input rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
              <button type="submit" className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                Cancel publish
              </button>
            </form>
          )}
          {canReschedule && (
            <form action={reschedulePublish} className="flex items-center gap-2">
              <input type="hidden" name="client_id" value={id} />
              <input type="hidden" name="publish_id" value={p.id} />
              <input
                type="datetime-local"
                name="scheduled_for"
                required
                className="form-input rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
              <button type="submit" className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d655d]">
                Reschedule
              </button>
            </form>
          )}
          {canRetry && (
            <form action={retryPublish}>
              <input type="hidden" name="client_id" value={id} />
              <input type="hidden" name="publish_id" value={p.id} />
              <input type="hidden" name="draft_id" value={p.draft_id} />
              <input type="hidden" name="platforms" value={p.platforms.join(',')} />
              <button type="submit" className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d655d]">
                Retry (creates new attempt)
              </button>
            </form>
          )}
          {!canCancel && !canReschedule && !canRetry && (
            <p className="text-xs text-[#6B7C79]">No actions available for this status.</p>
          )}
        </div>
      </section>

      {/* Draft summary */}
      {draft && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Draft</h2>
            <Link href={`/admin/brand-engine/${id}/drafts/${draft.id}`} className="text-xs text-[#0F766E] hover:underline">
              Open draft &rarr;
            </Link>
          </div>
          <p className="line-clamp-3 whitespace-pre-wrap text-sm text-[#1C2B28]">{(draft.draft_body as string).slice(0, 400)}</p>
        </section>
      )}

      {/* Retry history */}
      {retryHistory.length > 0 && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Retry chain ({retryHistory.length} prior attempts)</h2>
          <ul className="space-y-2 text-sm">
            {retryHistory.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/brand-engine/${id}/publishes/${r.id}`} className="font-mono text-xs text-[#6B7C79] hover:text-[#0F766E] hover:underline">
                  {r.id.slice(0, 8)}
                </Link>
                <span className="ml-2 text-xs">
                  · <span className={STATUS_BADGE[r.status]?.split(' ')[1] ?? ''}>{r.status}</span>
                  {r.failure_reason && <span className="ml-2 text-[#6B7C79]">— {r.failure_reason.slice(0, 80)}</span>}
                  <span className="ml-2 font-mono text-[#6B7C79]">{new Date(r.created_at).toISOString().slice(0, 16).replace('T', ' ')}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Audit timeline */}
      {(audits ?? []).length > 0 && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Status timeline ({(audits ?? []).length})</h2>
          <ul className="space-y-2 text-sm">
            {((audits ?? []) as AuditRow[]).map((a, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-[#6B7C79]">
                  {new Date(a.occurred_at).toISOString().slice(0, 19).replace('T', ' ')}
                </span>
                <span className="font-medium text-[#1C2B28]">{a.action}</span>
                <span className="text-xs text-[#6B7C79]">{a.actor_type}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.response_payload && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <details>
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Raw Ayrshare response (debug)</summary>
            <pre className="mt-3 overflow-auto rounded bg-slate-50 p-3 text-xs text-[#1C2B28]">{JSON.stringify(p.response_payload, null, 2)}</pre>
          </details>
        </section>
      )}
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
