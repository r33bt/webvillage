import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { generateVariants, sendReply, dismissEvent } from './actions'

export const dynamic = 'force-dynamic'

interface InboxEvent {
  id: string
  client_id: string
  vista_event_id: string
  event_type: string
  source_handle: string | null
  source_display_name: string | null
  source_external_id: string | null
  source_excerpt: string | null
  source_payload: Record<string, unknown>
  received_at: string
  occurred_at: string | null
  reply_sent_at: string | null
  reply_body_final: string | null
  vista_reply_id: string | null
  send_failure_reason: string | null
  dismissed_at: string | null
  dismiss_reason: string | null
}

interface DraftRow {
  id: string
  draft_body: string
  status: string
  generated_at: string
}

interface ScoreRow {
  draft_id: string
  scores: { provenance: number; specificity: number; structure: number; voice: number; utility: number; average?: number }
  passes_threshold: boolean
  banned_phrase_hits: string[]
  flags: { hard_fail?: boolean; retry_count?: number; flag_count?: number }
}

const CHAR_LIMIT: Record<string, number> = {
  comment: 1300,
  mention: 1300,
  dm: 3000,
  reaction: 280,
}

export default async function InboxEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; event_id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id, event_id } = await params
  const { error: errorParam } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: event }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb.from('wv_be_inbox_events').select('*').eq('id', event_id).maybeSingle(),
  ])

  if (!client || !event) notFound()
  const e = event as InboxEvent

  // Fetch all draft variants for this inbox event
  const { data: drafts } = await sb
    .from('wv_be_drafts')
    .select('id, draft_body, status, generated_at')
    .eq('inbox_event_id', event_id)
    .eq('source_type', 'reply')
    .order('generated_at', { ascending: false })

  const draftIds = (drafts ?? []).map((d) => d.id as string)
  let scoresByDraft = new Map<string, ScoreRow>()
  if (draftIds.length > 0) {
    const { data: scores } = await sb.from('wv_be_scores').select('*').in('draft_id', draftIds)
    for (const s of scores ?? []) scoresByDraft.set(s.draft_id as string, s as never)
  }

  const variants = ((drafts ?? []) as DraftRow[]).map((d) => ({
    ...d,
    score: scoresByDraft.get(d.id) ?? null,
  }))

  // Pick recommended variant: highest voice + specificity, no hard fail
  const recommended = variants
    .filter((v) => v.score && !v.score.flags.hard_fail)
    .sort((a, b) => {
      const av = (a.score?.scores.voice ?? 0) + (a.score?.scores.specificity ?? 0)
      const bv = (b.score?.scores.voice ?? 0) + (b.score?.scores.specificity ?? 0)
      return bv - av
    })[0]

  const charLimit = CHAR_LIMIT[e.event_type] ?? 1300
  const canReply = !e.reply_sent_at && !e.dismissed_at
  const isReplied = !!e.reply_sent_at
  const isDismissed = !!e.dismissed_at

  const sourcePermalink =
    typeof e.source_payload?.permalink === 'string' ? e.source_payload.permalink : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/inbox`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; All inbox events
      </Link>

      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">{e.event_type}</p>
          <h1 className="text-xl font-bold text-[#1C2B28]">{e.source_display_name ?? e.source_handle ?? 'unknown'}</h1>
          <p className="font-mono text-xs text-[#6B7C79]">{e.id}</p>
        </div>
        <div className="text-right text-xs text-[#6B7C79]">
          Received: {new Date(e.received_at).toISOString().slice(0, 19).replace('T', ' ')}
          {e.occurred_at && (
            <div>Occurred: {new Date(e.occurred_at).toISOString().slice(0, 19).replace('T', ' ')}</div>
          )}
        </div>
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-1 font-semibold">Last action failed</p>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
        </div>
      )}

      {/* Source pane */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Source</h2>
        <p className="mb-3 whitespace-pre-wrap text-sm text-[#1C2B28]">{e.source_excerpt ?? '(no excerpt)'}</p>
        {sourcePermalink && (
          <p className="text-xs">
            <a href={sourcePermalink} target="_blank" rel="noopener noreferrer" className="text-[#0F766E] hover:underline">
              View original on LinkedIn &rarr;
            </a>
          </p>
        )}
      </section>

      {/* Variants pane */}
      {!isDismissed && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Reply variants ({variants.length})</h2>
            {canReply && (
              <form action={generateVariants} className="flex items-center gap-2">
                <input type="hidden" name="client_id" value={id} />
                <input type="hidden" name="event_id" value={event_id} />
                <input
                  name="founder_hint"
                  placeholder="Optional steer (e.g. 'keep it short')"
                  className="form-input rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
                <select
                  name="variant_count"
                  defaultValue="3"
                  className="form-select rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
                >
                  <option value="1">1</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d655d]"
                >
                  {variants.length === 0 ? 'Generate replies' : 'Generate more'}
                </button>
              </form>
            )}
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-[#6B7C79]">
              No drafts yet. Click "Generate replies" to fire 3 voice-aware variants in parallel.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v) => {
                const isRecommended = recommended?.id === v.id
                const score = v.score
                return (
                  <div
                    key={v.id}
                    className={`rounded-lg border p-4 ${isRecommended ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/30'}`}
                  >
                    <div className="mb-2 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        {isRecommended && (
                          <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                            ★ recommended
                          </span>
                        )}
                        {score?.flags.hard_fail && (
                          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700">
                            hard fail
                          </span>
                        )}
                        {(score?.banned_phrase_hits.length ?? 0) > 0 && (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                            {score!.banned_phrase_hits.length} banned hits
                          </span>
                        )}
                      </div>
                      {score && (
                        <div className="font-mono text-xs text-[#6B7C79]">
                          V {score.scores.voice} · S {score.scores.specificity}
                        </div>
                      )}
                    </div>
                    <p className="mb-2 whitespace-pre-wrap text-sm text-[#1C2B28]">{v.draft_body}</p>
                    <p className="text-xs text-[#6B7C79]">{v.draft_body.length} chars</p>
                    {canReply && (
                      <form action={sendReply} className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                        <input type="hidden" name="client_id" value={id} />
                        <input type="hidden" name="event_id" value={event_id} />
                        <input type="hidden" name="draft_id" value={v.id} />
                        <input type="hidden" name="reply_to_external_id" value={e.source_external_id ?? ''} />
                        <textarea
                          name="reply_body_final"
                          defaultValue={v.draft_body}
                          rows={3}
                          maxLength={charLimit}
                          required
                          className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#6B7C79]">
                            Edit before sending if you want. Char limit: {charLimit} ({e.event_type})
                          </p>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d655d]"
                          >
                            Send via Vista
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Dismiss action (only if not yet replied/dismissed) */}
      {canReply && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <form action={dismissEvent} className="flex items-center gap-3">
            <input type="hidden" name="client_id" value={id} />
            <input type="hidden" name="event_id" value={event_id} />
            <input
              name="reason"
              placeholder="Dismiss reason (optional — 'spam', 'off-topic', etc.)"
              className="form-input flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7C79] hover:border-red-300 hover:text-red-700"
            >
              Dismiss without reply
            </button>
          </form>
        </section>
      )}

      {/* Replied state */}
      {isReplied && (
        <section className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-800">Replied</h2>
          <p className="mb-2 whitespace-pre-wrap text-sm text-[#1C2B28]">{e.reply_body_final}</p>
          <p className="text-xs text-[#6B7C79]">
            Sent: {e.reply_sent_at && new Date(e.reply_sent_at).toISOString().slice(0, 19).replace('T', ' ')} ·
            Vista reply ID: <span className="font-mono">{e.vista_reply_id ?? '—'}</span>
          </p>
        </section>
      )}

      {isDismissed && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-slate-100 p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Dismissed</h2>
          <p className="text-sm text-[#1C2B28]">{e.dismiss_reason ?? '(no reason given)'}</p>
          <p className="mt-1 text-xs text-[#6B7C79]">
            {e.dismissed_at && new Date(e.dismissed_at).toISOString().slice(0, 19).replace('T', ' ')}
          </p>
        </section>
      )}
    </div>
  )
}
