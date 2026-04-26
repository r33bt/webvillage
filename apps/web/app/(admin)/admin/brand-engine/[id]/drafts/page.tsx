import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

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
}

interface ScoreRow {
  draft_id: string
  scoring_model: string
  scores: { provenance: number; specificity: number; structure: number; voice: number; utility: number; average?: number }
  flags: { hard_fail?: boolean; retry_count?: number; flag_count?: number; voice_score_deduction?: number }
  banned_phrase_hits: string[]
  passes_threshold: boolean
}

const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  generated: 'bg-amber-50 text-amber-700 border-amber-200',
  edited: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  published: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  archived: 'bg-slate-50 text-slate-600 border-slate-200',
}

function bandLabel(avg: number, hardFail: boolean): string {
  if (hardFail) return 'Hard fail'
  if (avg >= 85) return '≥85 publishable'
  if (avg >= 70) return '70-84 founder review'
  if (avg >= 60) return '60-69 reviewer queue'
  return '<60 auto-fail'
}

function bandClass(avg: number, hardFail: boolean): string {
  if (hardFail || avg < 60) return 'bg-red-50 text-red-700 border-red-200'
  if (avg >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (avg >= 70) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-orange-50 text-orange-700 border-orange-200'
}

export default async function DraftsListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: drafts }, { data: scores }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_drafts')
      .select('*')
      .eq('client_id', id)
      .order('generated_at', { ascending: false })
      .limit(100),
    sb.from('wv_be_scores').select('*').eq('client_id', id).order('scored_at', { ascending: false }).limit(100),
  ])

  if (!client) notFound()

  const draftRows = (drafts ?? []) as DraftRow[]
  const scoreByDraftId = new Map<string, ScoreRow>()
  for (const s of (scores ?? []) as ScoreRow[]) scoreByDraftId.set(s.draft_id, s)

  // Group regen siblings under the original parent (for visual grouping)
  // Each row: either a top-level draft (parent_draft_id NULL) or a regen of one
  const groups = new Map<string, DraftRow[]>()
  for (const d of draftRows) {
    const groupKey = d.parent_draft_id ?? d.id
    if (!groups.has(groupKey)) groups.set(groupKey, [])
    groups.get(groupKey)!.push(d)
  }
  // Sort each group by generated_at DESC
  for (const arr of groups.values()) arr.sort((a, b) => b.generated_at.localeCompare(a.generated_at))
  // Sort groups by latest draft in group DESC
  const sortedGroups = Array.from(groups.entries()).sort(
    (a, b) => (b[1][0]?.generated_at ?? '').localeCompare(a[1][0]?.generated_at ?? '')
  )

  const totalDrafts = draftRows.length
  const totalCostCents = draftRows.reduce((s, d) => s + (d.generation_cost_cents ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Drafts</p>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="text-sm text-[#6B7C79]">
            {totalDrafts} draft{totalDrafts === 1 ? '' : 's'} ·{' '}
            {sortedGroups.length} group{sortedGroups.length === 1 ? '' : 's'} (regens nested) · gen cost ${(totalCostCents / 100).toFixed(2)}
          </p>
        </div>
        <Link
          href={`/admin/brand-engine/${id}/drafts/new`}
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
        >
          + New draft
        </Link>
      </div>

      {totalDrafts === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="mb-2 font-semibold">No drafts yet.</p>
          <p>
            Click "New draft" above to generate the first draft for this client. Requires Anthropic credits in the
            Vercel-set <span className="font-mono">ANTHROPIC_API_KEY</span>. Smoke test (
            <span className="font-mono">apps/web/scripts/smoke-slice-3.ts</span>) bypasses the UI.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGroups.map(([groupKey, members]) => (
            <DraftGroup key={groupKey} groupKey={groupKey} members={members} clientId={id} scoreByDraftId={scoreByDraftId} />
          ))}
        </div>
      )}
    </div>
  )
}

function DraftGroup({
  groupKey,
  members,
  clientId,
  scoreByDraftId,
}: {
  groupKey: string
  members: DraftRow[]
  clientId: string
  scoreByDraftId: Map<string, ScoreRow>
}) {
  const isRegen = members.length > 1
  const latest = members[0]!

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {isRegen && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-[#6B7C79]">
          {members.length} attempts — original at top, regenerations below
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {members.map((d, i) => {
          const score = scoreByDraftId.get(d.id)
          const avg = score?.scores?.average ?? (score ? avgFromScores(score.scores) : null)
          const hardFail = score?.flags?.hard_fail ?? false
          return (
            <div key={d.id} className={i === 0 ? 'bg-white' : 'bg-slate-50/30'}>
              <Link
                href={`/admin/brand-engine/${clientId}/drafts/${d.id}`}
                className="block px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    {i > 0 && <span className="font-mono text-xs text-[#6B7C79]">↳ regen #{members.length - i}</span>}
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[d.status] ?? 'bg-slate-50'}`}>
                      {d.status}
                    </span>
                    <span className="font-mono text-xs text-[#6B7C79]">{d.source_type}</span>
                    {d.platform && <span className="font-mono text-xs text-[#6B7C79]">/ {d.platform}</span>}
                    {avg !== null && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${bandClass(avg, hardFail)}`}>
                        {hardFail ? 'hard fail' : `score ${avg.toFixed(0)}`} · {bandLabel(avg, hardFail)}
                      </span>
                    )}
                    {(score?.banned_phrase_hits.length ?? 0) > 0 && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        {score!.banned_phrase_hits.length} banned-phrase hit{score!.banned_phrase_hits.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#6B7C79]">
                    {new Date(d.generated_at).toISOString().slice(0, 16).replace('T', ' ')} ·{' '}
                    ${((d.generation_cost_cents ?? 0) / 100).toFixed(3)}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm text-[#6B7C79]">
                  <span className="font-semibold text-[#1C2B28]">prompt:</span> {d.prompt_text}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-[#1C2B28]">{d.draft_body}</p>
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function avgFromScores(s: { provenance: number; specificity: number; structure: number; voice: number; utility: number }): number {
  return (s.provenance + s.specificity + s.structure + s.voice + s.utility) / 5
}
