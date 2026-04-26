import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { upsertVoiceProfile } from './actions'

export const dynamic = 'force-dynamic'

interface VoiceProfile {
  id: string
  client_id: string
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

const REGISTERS = ['casual', 'professional', 'academic', 'plainspoken', 'authoritative', 'warm']
const QUALITY_TIERS = ['standard', 'editorial']
const INTAKE_METHODS = ['questionnaire_only', 'url_extraction', 'sample_posts', 'editor_built']

export default async function VoiceIntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createSupabaseServiceClient()
  const [{ data: client }, { data: profile }, { data: versions }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name, current_tier').eq('id', id).is('deleted_at', null).single(),
    sb.from('wv_be_voice_profiles').select('*').eq('client_id', id).maybeSingle(),
    sb.from('wv_be_voice_profile_versions').select('version, superseded_at, reason').eq('client_id', id).order('version', { ascending: false }).limit(5),
  ])

  if (!client) notFound()
  const vp = profile as VoiceProfile | null

  const linesValue = (arr: string[] | null | undefined) => (arr ?? []).join('\n')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Voice profile</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
        <p className="text-sm text-[#6B7C79]">
          {vp ? (
            <>v{vp.version} · last refined {vp.last_refined_at ? new Date(vp.last_refined_at).toISOString().slice(0, 10) : '—'}</>
          ) : (
            'No voice profile yet — fill the form below to create v1.'
          )}
        </p>
      </div>

      <form action={upsertVoiceProfile} className="space-y-8">
        <input type="hidden" name="client_id" value={id} />

        <Section title="Core voice attributes">
          <Field label="Audience" hint="Who do you write for? One sentence.">
            <input
              name="audience"
              defaultValue={vp?.audience ?? ''}
              className="form-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              placeholder="e.g. Malaysian Muslim professionals navigating personal finance"
            />
          </Field>

          <Field label="One-word tone" hint="One word that captures the voice.">
            <input
              name="one_word_tone"
              defaultValue={vp?.one_word_tone ?? ''}
              className="form-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              placeholder="e.g. plainspoken"
            />
          </Field>

          <Field label="Never sound like (max 5)" hint="Brands or vibes the voice should never resemble. One per line, max 5.">
            <textarea
              name="never_sound_like"
              defaultValue={linesValue(vp?.never_sound_like)}
              rows={4}
              className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              placeholder="A motivational LinkedIn influencer&#10;A traditional bank&#10;A crypto bro"
            />
          </Field>

          <Field label="Register" hint="The default register for this brand's voice.">
            <select
              name="register"
              defaultValue={vp?.register ?? ''}
              className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">— select —</option>
              {REGISTERS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Style rules">
          <Field label="Do list" hint="Always-do rules. One per line.">
            <textarea
              name="do_list"
              defaultValue={linesValue(vp?.do_list)}
              rows={5}
              className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              placeholder="Use plain English where possible&#10;Cite primary sources for figures&#10;Lead with what the reader can do"
            />
          </Field>

          <Field label="Don't list" hint="Never-do rules. One per line.">
            <textarea
              name="dont_list"
              defaultValue={linesValue(vp?.dont_list)}
              rows={5}
              className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              placeholder="No financial advice without disclaimers&#10;No comparative claims without a defined comparison set"
            />
          </Field>

          <Field label="Reading grade target" hint="Flesch–Kincaid grade target (e.g. 8.5).">
            <input
              name="reading_grade_target"
              defaultValue={vp?.reading_grade_target?.toString() ?? ''}
              type="number"
              step="0.1"
              min="3"
              max="18"
              className="form-input w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              placeholder="8.5"
            />
          </Field>

          <Field label="Signature phrases" hint="Distinctive recurring phrases. One per line.">
            <textarea
              name="signature_phrases"
              defaultValue={linesValue(vp?.signature_phrases)}
              rows={3}
              className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </Field>

          <Field label="Forbidden register" hint="Maps to anti-slop overlay §5 categories. One per line. e.g. narrative, dramatic, managerial-padding">
            <textarea
              name="forbidden_register"
              defaultValue={linesValue(vp?.forbidden_register)}
              rows={3}
              className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              placeholder="narrative-register&#10;managerial-padding"
            />
          </Field>
        </Section>

        <Section title="Provenance + tier">
          <Field label="Intake method">
            <select
              name="intake_method"
              defaultValue={vp?.intake_method ?? 'questionnaire_only'}
              className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              {INTAKE_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Source URL" hint="If intake method is url_extraction, the source URL.">
            <input
              name="source_url"
              defaultValue={vp?.source_url ?? ''}
              type="url"
              className="form-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </Field>

          <Field label="Quality tier" hint="standard = Tool tier · editorial = Editorial tier (adds expert review escalation)">
            <select
              name="quality_tier"
              defaultValue={vp?.quality_tier ?? 'standard'}
              className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              {QUALITY_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <p className="text-xs text-[#6B7C79]">
            Saving creates {vp ? `v${vp.version + 1}` : 'v1'}; previous versions are preserved in <span className="font-mono">wv_be_voice_profile_versions</span>.
          </p>
          <button
            type="submit"
            className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
          >
            Save voice profile
          </button>
        </div>
      </form>

      {versions && versions.length > 0 && (
        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold text-[#1C2B28]">Recent versions</h2>
          <ul className="space-y-2 text-sm">
            {versions.map((v) => (
              <li key={v.version} className="flex justify-between text-[#6B7C79]">
                <span>
                  v{v.version} <span className="ml-2 text-xs italic">{v.reason}</span>
                </span>
                <span className="font-mono text-xs">{new Date(v.superseded_at).toISOString().slice(0, 16).replace('T', ' ')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-bold text-[#1C2B28]">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">{label}</label>
      {hint && <p className="mb-2 text-xs text-[#6B7C79]">{hint}</p>}
      {children}
    </div>
  )
}
