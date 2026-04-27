import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { regenerateDraft, updateDraftStatus, publishDraft } from './actions'

export const dynamic = 'force-dynamic'

interface DraftRow {
  id: string
  client_id: string
  source_type: string
  template_id: string | null
  voice_profile_version: number
  prompt_text: string
  draft_body: string
  platform: string | null
  status: string
  generation_model: string
  generation_tokens_in: number | null
  generation_tokens_out: number | null
  generation_cost_cents: number | null
  generated_at: string
  parent_draft_id: string | null
  cluster_id: string | null
  cluster_slot: number | null
  outreach_sequence_id: string | null
  outreach_step: number | null
  language: string
  scheduled_for?: string | null
  published_at?: string | null
  last_publish_id?: string | null
}

interface ScoreRow {
  draft_id: string
  scoring_model: string
  scores: {
    provenance: number
    specificity: number
    structure: number
    voice: number
    utility: number
    average?: number
    rationale_per_pillar?: Record<string, string>
  }
  flags: { hard_fail?: boolean; retry_count?: number; flag_count?: number; voice_score_deduction?: number }
  banned_phrase_hits: string[]
  passes_threshold: boolean
  rubric_version: number
}

interface AuditRow {
  action: string
  after_state: Record<string, unknown>
  occurred_at: string
}

const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  generated: 'bg-amber-50 text-amber-700 border-amber-200',
  edited: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  published: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  archived: 'bg-slate-50 text-slate-600 border-slate-200',
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'approved', label: 'Approved (publishable)' },
  { value: 'edited', label: 'Edited (pending re-review)' },
  { value: 'generated', label: 'Generated (back to queue)' },
  { value: 'rejected', label: 'Rejected (do not use)' },
  { value: 'archived', label: 'Archived (hide)' },
]

export default async function DraftDetailPage({ params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: draft }, { data: score }, { data: voice }, { data: template }, { data: audit }] =
    await Promise.all([
      sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
      sb.from('wv_be_drafts').select('*').eq('id', draftId).eq('client_id', id).single(),
      sb.from('wv_be_scores').select('*').eq('draft_id', draftId).maybeSingle(),
      sb.from('wv_be_voice_profiles').select('*').eq('client_id', id).single(),
      // template_id may be null; fetch nullable
      sb.from('wv_be_templates').select('id, name, template_type, platform').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
      sb.from('wv_be_audit_log').select('action, after_state, occurred_at').eq('target_id', draftId).order('occurred_at', { ascending: false }),
    ])

  if (!client || !draft) notFound()

  const d = draft as DraftRow
  const s = score as ScoreRow | null
  const auditRows = (audit ?? []) as AuditRow[]

  // Fetch the actual template row
  type TemplateRow = { id: string; name: string; template_type: string; platform: string | null }
  let templateRow: TemplateRow | null = null
  if (d.template_id) {
    const { data: tpl } = await sb.from('wv_be_templates').select('id, name, template_type, platform').eq('id', d.template_id).maybeSingle()
    templateRow = (tpl as TemplateRow | null) ?? null
  }

  const avg = s?.scores?.average ?? (s ? avgFromScores(s.scores) : null)
  const hardFail = s?.flags?.hard_fail ?? false
  const totalCost = (d.generation_cost_cents ?? 0) + (auditRows.find((a) => a.action === 'draft_scoring')?.after_state?.cost_cents as number | undefined ?? 0)

  // Sibling regens
  const { data: siblings } = await sb
    .from('wv_be_drafts')
    .select('id, generated_at, status, parent_draft_id')
    .eq('client_id', id)
    .or(d.parent_draft_id ? `parent_draft_id.eq.${d.parent_draft_id},id.eq.${d.parent_draft_id}` : `parent_draft_id.eq.${d.id}`)
    .order('generated_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/drafts`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; All drafts
      </Link>

      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Draft</p>
          <h1 className="text-xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="font-mono text-xs text-[#6B7C79]">{d.id}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGE[d.status] ?? 'bg-slate-50'}`}>
            {d.status}
          </span>
          <span className="font-mono text-xs text-[#6B7C79]">{d.source_type}</span>
          {d.platform && <span className="font-mono text-xs text-[#6B7C79]">/ {d.platform}</span>}
        </div>
      </div>

      {d.parent_draft_id && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900">
          This is a regeneration. Original parent:{' '}
          <Link href={`/admin/brand-engine/${id}/drafts/${d.parent_draft_id}`} className="font-mono text-xs underline">
            {d.parent_draft_id.slice(0, 8)}...
          </Link>
        </div>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Prompt</h2>
        <p className="whitespace-pre-wrap text-sm text-[#1C2B28]">{d.prompt_text}</p>
        {templateRow && (
          <p className="mt-3 text-xs text-[#6B7C79]">
            Template: <span className="font-medium text-[#1C2B28]">{templateRow.name}</span> ({templateRow.template_type})
          </p>
        )}
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Draft body</h2>
        <pre className="whitespace-pre-wrap font-sans text-sm text-[#1C2B28]">{d.draft_body}</pre>
        <p className="mt-4 text-xs text-[#6B7C79]">{d.draft_body.length} chars · language: {d.language}</p>
      </section>

      {s && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">5-pillar score</h2>
            {avg !== null && (
              <div className="text-right">
                <div className="text-2xl font-bold text-[#0F766E]">{avg.toFixed(1)}</div>
                <div className="text-xs text-[#6B7C79]">average · {s.passes_threshold ? '✓ passes' : '✗ fails'} threshold</div>
              </div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <PillarBar label="Provenance" score={s.scores.provenance} rationale={s.scores.rationale_per_pillar?.provenance} />
            <PillarBar label="Specificity" score={s.scores.specificity} rationale={s.scores.rationale_per_pillar?.specificity} />
            <PillarBar label="Structure" score={s.scores.structure} rationale={s.scores.rationale_per_pillar?.structure} />
            <PillarBar
              label="Voice"
              score={s.scores.voice}
              rationale={s.scores.rationale_per_pillar?.voice}
              note={s.flags.voice_score_deduction ? `(${s.flags.voice_score_deduction} from flag hits)` : undefined}
            />
            <PillarBar label="Utility" score={s.scores.utility} rationale={s.scores.rationale_per_pillar?.utility} />
          </div>

          {hardFail && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-900">
              Hard fail. Retry count: {s.flags.retry_count ?? 0}
            </div>
          )}

          {s.banned_phrase_hits.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">
                Banned-phrase hits ({s.banned_phrase_hits.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {s.banned_phrase_hits.map((p, i) => (
                  <span key={i} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs text-amber-800">
                    "{p}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Generation + scoring meta</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Generation model" value={d.generation_model} />
          <Field label="Voice profile version" value={`v${d.voice_profile_version}`} />
          <Field label="Generation tokens" value={`${d.generation_tokens_in ?? '?'} in / ${d.generation_tokens_out ?? '?'} out`} />
          <Field label="Generation cost" value={`$${((d.generation_cost_cents ?? 0) / 100).toFixed(3)}`} />
          {s && (
            <>
              <Field label="Scoring model" value={s.scoring_model} />
              <Field label="Rubric version" value={`v${s.rubric_version}`} />
            </>
          )}
          <Field label="Total cost" value={`$${(totalCost / 100).toFixed(3)}`} />
          <Field label="Generated at" value={new Date(d.generated_at).toISOString().replace('T', ' ').slice(0, 19)} />
        </dl>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Actions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <form action={regenerateDraft}>
            <input type="hidden" name="draft_id" value={d.id} />
            <button
              type="submit"
              className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
            >
              Regenerate (creates new draft as child)
            </button>
          </form>
          <span className="text-xs text-[#6B7C79]">|</span>
          <form action={updateDraftStatus} className="flex items-center gap-2">
            <input type="hidden" name="draft_id" value={d.id} />
            <select
              name="new_status"
              defaultValue={d.status}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-[#1C2B28] hover:bg-slate-50"
            >
              Update status
            </button>
          </form>
        </div>
      </section>

      {/* Slice 8: Publish controls (only when draft is publishable) */}
      {(d.status === 'approved' || d.status === 'edited') && d.source_type !== 'reply' && (
        <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-800">Publish to LinkedIn (Ayrshare)</h2>
          {d.published_at ? (
            <p className="text-sm text-emerald-900">
              Already published at {new Date(d.published_at).toISOString().slice(0, 19).replace('T', ' ')}.
              {d.last_publish_id && (
                <Link
                  href={`/admin/brand-engine/${id}/publishes/${d.last_publish_id}`}
                  className="ml-2 text-[#0F766E] hover:underline"
                >
                  View publish &rarr;
                </Link>
              )}
            </p>
          ) : d.scheduled_for ? (
            <p className="text-sm text-emerald-900">
              Scheduled for {new Date(d.scheduled_for).toISOString().slice(0, 19).replace('T', ' ')}.
              {d.last_publish_id && (
                <Link
                  href={`/admin/brand-engine/${id}/publishes/${d.last_publish_id}`}
                  className="ml-2 text-[#0F766E] hover:underline"
                >
                  Manage scheduled publish &rarr;
                </Link>
              )}
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <form action={publishDraft}>
                <input type="hidden" name="client_id" value={id} />
                <input type="hidden" name="draft_id" value={d.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
                >
                  Publish now
                </button>
              </form>
              <form action={publishDraft} className="flex items-end gap-2">
                <input type="hidden" name="client_id" value={id} />
                <input type="hidden" name="draft_id" value={d.id} />
                <div>
                  <label className="mb-1 block text-xs font-semibold text-emerald-800">Schedule for</label>
                  <input
                    type="datetime-local"
                    name="scheduled_for"
                    required
                    className="form-input rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  Schedule
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      {voice && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">
            Voice snapshot used (v{d.voice_profile_version})
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Field label="One-word tone" value={(voice as { one_word_tone: string | null }).one_word_tone ?? '—'} />
            <Field label="Register" value={(voice as { register: string | null }).register ?? '—'} />
            <Field label="Audience" value={(voice as { audience: string | null }).audience ?? '—'} />
            <Field label="Quality tier" value={(voice as { quality_tier: string }).quality_tier} />
          </dl>
          <p className="mt-3 text-xs text-[#6B7C79]">
            <Link href={`/admin/brand-engine/${id}/voice`} className="text-[#0F766E] hover:underline">
              View / edit voice profile &rarr;
            </Link>
          </p>
        </section>
      )}

      {(siblings?.length ?? 0) > 1 && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">
            Regen siblings ({siblings!.length} total)
          </h2>
          <ul className="space-y-1 text-sm">
            {siblings!.map((sib) => (
              <li key={sib.id}>
                {sib.id === d.id ? (
                  <span className="font-mono text-xs text-[#0F766E]">→ {sib.id.slice(0, 8)} (this one)</span>
                ) : (
                  <Link href={`/admin/brand-engine/${id}/drafts/${sib.id}`} className="font-mono text-xs text-[#6B7C79] hover:text-[#0F766E] hover:underline">
                    {sib.id.slice(0, 8)}
                  </Link>
                )}
                <span className="ml-2 text-xs text-[#6B7C79]">
                  · {sib.status} · {new Date(sib.generated_at).toISOString().slice(0, 16).replace('T', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {auditRows.length > 0 && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">Audit log ({auditRows.length})</h2>
          <ul className="space-y-2 text-sm">
            {auditRows.map((a, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-[#6B7C79]">
                  {new Date(a.occurred_at).toISOString().slice(0, 19).replace('T', ' ')}
                </span>
                <span className="font-medium text-[#1C2B28]">{a.action}</span>
                <span className="text-xs text-[#6B7C79]">
                  {(a.after_state.model as string | undefined) ?? ''}
                  {a.after_state.tokens_in ? ` · ${a.after_state.tokens_in}↓/${a.after_state.tokens_out}↑` : ''}
                  {a.after_state.cost_cents !== undefined ? ` · $${((a.after_state.cost_cents as number) / 100).toFixed(3)}` : ''}
                  {a.after_state.latency_ms ? ` · ${a.after_state.latency_ms}ms` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function avgFromScores(s: { provenance: number; specificity: number; structure: number; voice: number; utility: number }): number {
  return (s.provenance + s.specificity + s.structure + s.voice + s.utility) / 5
}

function PillarBar({ label, score, rationale, note }: { label: string; score: number; rationale?: string; note?: string }) {
  const color = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-[#1C2B28]">
          {label} {note && <span className="text-xs font-normal text-[#6B7C79]">{note}</span>}
        </span>
        <span className="font-mono text-sm font-semibold text-[#0F766E]">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      {rationale && <p className="mt-1 text-xs italic text-[#6B7C79]">{rationale}</p>}
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
