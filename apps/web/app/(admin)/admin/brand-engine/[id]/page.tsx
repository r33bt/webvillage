import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface VoiceProfile {
  id: string
  version: number
  intake_method: string
  source_url: string | null
  audience: string | null
  one_word_tone: string | null
  never_sound_like: string[] | null
  register: string | null
  do_list: string[] | null
  dont_list: string[] | null
  reading_grade_target: number | null
  signature_phrases: string[] | null
  forbidden_register: string[] | null
  quality_tier: string
  established_at: string
  last_refined_at: string | null
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseServiceClient()

  const [{ data: client }, { data: profile }, { data: bannedPhrases }] = await Promise.all([
    supabase.from('wv_be_clients').select('*').eq('id', id).is('deleted_at', null).single(),
    supabase.from('wv_be_voice_profiles').select('*').eq('client_id', id).single(),
    supabase.from('wv_be_client_banned_phrases').select('*').eq('client_id', id).is('deleted_at', null),
  ])

  if (!client) {
    notFound()
  }

  const vp = profile as VoiceProfile | null

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/admin/brand-engine" className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; All clients
      </Link>

      <h1 className="mb-1 text-3xl font-bold text-[#1C2B28]">{client.display_name}</h1>
      <p className="mb-1 text-[#6B7C79]">{client.legal_entity_name ?? '—'}</p>
      <p className="mb-8 font-mono text-xs text-[#6B7C79]">{client.id}</p>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#1C2B28]">Account</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Tier" value={client.current_tier} />
          <Field label="Lifecycle" value={client.lifecycle_stage ?? '—'} />
          <Field label="Industry" value={client.industry ?? '—'} />
          <Field label="Vertical origin" value={client.vertical_origin ?? '—'} />
          <Field label="Primary domain" value={client.primary_domain ?? '—'} />
          <Field
            label="Brand Engine intake"
            value={client.brand_engine_intake_completed_at ? new Date(client.brand_engine_intake_completed_at).toISOString().slice(0, 10) : 'pending'}
          />
          <Field label="Outreach add-on" value={client.outreach_addon_active ? 'Active' : 'Off'} />
          <Field
            label="Trial ends"
            value={client.trial_ends_at ? new Date(client.trial_ends_at).toISOString().slice(0, 10) : '—'}
          />
        </dl>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">Voice profile</h2>
          <div className="flex items-center gap-3 text-xs">
            {vp && <span className="text-[#6B7C79]">v{vp.version} · {vp.intake_method}</span>}
            <Link
              href={`/admin/brand-engine/${id}/voice`}
              className="rounded-lg bg-[#0F766E] px-3 py-1.5 font-semibold text-white transition-colors hover:bg-[#0d655d]"
            >
              {vp ? 'Edit' : 'Create'} voice profile &rarr;
            </Link>
          </div>
        </div>

        {vp ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Audience" value={vp.audience ?? '—'} />
            <Field label="One-word tone" value={vp.one_word_tone ?? '—'} />
            <Field label="Register" value={vp.register ?? '—'} />
            <Field label="Quality tier" value={vp.quality_tier} />
            <Field label="Reading grade target" value={vp.reading_grade_target?.toString() ?? '—'} />
            <Field label="Source URL" value={vp.source_url ?? '—'} />
            <ListField label="Never sound like" items={vp.never_sound_like} />
            <ListField label="Forbidden register" items={vp.forbidden_register} />
            <ListField label="Do list" items={vp.do_list} />
            <ListField label="Don't list" items={vp.dont_list} />
            <ListField label="Signature phrases" items={vp.signature_phrases} />
          </dl>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No voice profile yet. Click "Create voice profile" above to fill the intake form.
          </div>
        )}
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">Templates</h2>
          <Link
            href={`/admin/brand-engine/${id}/templates`}
            className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0d655d]"
          >
            View templates &rarr;
          </Link>
        </div>
        <p className="text-sm text-[#6B7C79]">
          Brand-specific overrides + 15 WV canon defaults available for draft generation.
        </p>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">Drafts</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/brand-engine/${id}/drafts/new`}
              className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0d655d]"
            >
              + New draft
            </Link>
            <Link
              href={`/admin/brand-engine/${id}/drafts`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#1C2B28] hover:bg-slate-50"
            >
              View all &rarr;
            </Link>
          </div>
        </div>
        <p className="text-sm text-[#6B7C79]">
          Voice-aware AI drafts with 5-pillar scoring + per-phrase banned-phrase enforcement. Sonnet 4.6 generates, Haiku 4.5 scores.
        </p>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">Visual assets</h2>
          <Link
            href={`/admin/brand-engine/${id}/assets`}
            className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0d655d]"
          >
            View assets &rarr;
          </Link>
        </div>
        <p className="text-sm text-[#6B7C79]">
          Logo, palette, mood board, banners + Ideogram v3 image generation (palette + mood board auto-injected into prompt).
        </p>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">Inbox (Vista LinkedIn)</h2>
          <Link
            href={`/admin/brand-engine/${id}/inbox`}
            className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0d655d]"
          >
            View inbox &rarr;
          </Link>
        </div>
        <p className="text-sm text-[#6B7C79]">
          Voice-aware reply variants for LinkedIn mentions/DMs/comments via Vista Social. Founder approves + sends; no auto-reply.
        </p>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">Topic clusters</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/brand-engine/${id}/clusters/new`}
              className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0d655d]"
            >
              + New cluster
            </Link>
            <Link
              href={`/admin/brand-engine/${id}/clusters`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#1C2B28] hover:bg-slate-50"
            >
              View all &rarr;
            </Link>
          </div>
        </div>
        <p className="text-sm text-[#6B7C79]">
          Plan multi-slot clusters with peer-aware generation. Async via Vercel cron worker (1 slot / minute); pause-on-fail with resume.
        </p>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#1C2B28]">
          Per-client banned phrases <span className="text-sm font-normal text-[#6B7C79]">({bannedPhrases?.length ?? 0})</span>
        </h2>
        {bannedPhrases && bannedPhrases.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {bannedPhrases.map((p) => (
              <li key={p.id} className="flex items-baseline gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.severity === 'block' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {p.severity}
                </span>
                <span className="font-mono">"{p.phrase}"</span>
                {p.rationale && <span className="text-[#6B7C79]">— {p.rationale}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#6B7C79]">No client-specific banned phrases. Global canon (40+) still applies.</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-3 text-lg font-bold text-[#1C2B28]">Roadmap</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="text-emerald-700">&#10003; Tenancy + voice substrate schema (Phase A)</p>
          <p className="text-emerald-700">&#10003; Content + planning + audit schema (Phase B)</p>
          <p className="text-emerald-700">&#10003; Voice profile editor (this page)</p>
          <p className="text-emerald-700">&#10003; Banned-phrases canon (58 phrases)</p>
          <p className="text-emerald-700">&#10003; Templates library (15 WV canon + 6 V22 overrides)</p>
          <p className="text-emerald-700">&#10003; Draft generation API (Sonnet 4.6) + 5-pillar scoring (Haiku 4.5)</p>
          <p className="text-emerald-700">&#10003; Drafts UI (list + detail + new + regen + status overrides)</p>
          <p className="text-emerald-700">&#10003; Visual substrate (Ideogram v3 + brand asset uploads + signed URLs)</p>
          <p className="text-emerald-700">&#10003; Topic clusters (planner + sequential peer-aware generation + Vercel cron worker)</p>
          <p className="text-emerald-700">&#10003; Vista Social inbox (LinkedIn) — webhook + 3 reply variants + send-via-Vista (founder approval, no auto-reply)</p>
          <p className="text-[#6B7C79]">&middot; Brand health monthly view</p>
          <p className="text-[#6B7C79]">&middot; Stripe billing + Connect</p>
          <p className="text-[#6B7C79]">&middot; Outreach sequences</p>
          <p className="text-[#6B7C79]">&middot; Cluster planner + slot assignments</p>
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

function ListField({ label, items }: { label: string; items: string[] | null }) {
  return (
    <div className="sm:col-span-2">
      <dt className="text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">{label}</dt>
      <dd className="mt-1">
        {items && items.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <li key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-[#1C2B28]">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-[#6B7C79]">—</span>
        )}
      </dd>
    </div>
  )
}
