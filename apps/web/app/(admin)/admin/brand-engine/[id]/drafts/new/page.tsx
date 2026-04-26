import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { createDraft } from './actions'

export const dynamic = 'force-dynamic'

interface Template {
  id: string
  name: string
  template_type: string
  platform: string | null
  is_default: boolean
  source_template_id: string | null
}

interface VoiceProfile {
  id: string
  version: number
  one_word_tone: string | null
  register: string | null
}

export default async function NewDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; template?: string }>
}) {
  const { id } = await params
  const { error: errorParam, template: templatePreselect } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: voiceProfile }, { data: brandTemplates }, { data: canonTemplates }] =
    await Promise.all([
      sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
      sb.from('wv_be_voice_profiles').select('id, version, one_word_tone, register').eq('client_id', id).maybeSingle(),
      sb
        .from('wv_be_templates')
        .select('id, name, template_type, platform, is_default, source_template_id')
        .eq('client_id', id)
        .is('deleted_at', null)
        .order('template_type', { ascending: true }),
      sb
        .from('wv_be_templates')
        .select('id, name, template_type, platform, is_default, source_template_id')
        .is('client_id', null)
        .eq('is_default', true)
        .is('deleted_at', null)
        .order('template_type', { ascending: true }),
    ])

  if (!client) notFound()
  const vp = voiceProfile as VoiceProfile | null
  const overrides = (brandTemplates ?? []) as Template[]
  const canon = (canonTemplates ?? []) as Template[]

  // Filter canon templates to those NOT overridden by this brand (avoid duplicates in selector)
  const overriddenIds = new Set(overrides.map((o) => o.source_template_id).filter(Boolean))
  const availableCanon = canon.filter((c) => !overriddenIds.has(c.id))

  // Skip cluster templates from this slice (not yet supported)
  const eligibleOverrides = overrides.filter((t) => t.template_type !== 'cluster' && t.template_type !== 'banner')
  const eligibleCanon = availableCanon.filter((t) => t.template_type !== 'cluster' && t.template_type !== 'banner')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/drafts`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; All drafts
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">New draft</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
        {vp ? (
          <p className="text-sm text-[#6B7C79]">Voice profile v{vp.version} · {vp.one_word_tone}/{vp.register}</p>
        ) : (
          <p className="text-sm text-amber-700">⚠ No voice profile. <Link href={`/admin/brand-engine/${id}/voice`} className="underline">Create one first</Link>.</p>
        )}
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-1 font-semibold">Generation failed</p>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
          <p className="mt-2 text-xs text-red-700">
            Common cause: Anthropic credit balance is $0. Top up at console.anthropic.com → Plans &amp; Billing.
          </p>
        </div>
      )}

      {!vp ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Voice profile required before generating drafts. The draft generation pipeline injects voice attributes into the prompt.
        </div>
      ) : (
        <form action={createDraft} className="space-y-6">
          <input type="hidden" name="client_id" value={id} />

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <label className="mb-2 block text-sm font-semibold text-[#1C2B28]">Template</label>
            <p className="mb-3 text-xs text-[#6B7C79]">
              Brand overrides shown first. Canon defaults below if no brand override exists for that template type.
            </p>
            <select
              name="template_id"
              required
              defaultValue={templatePreselect ?? ''}
              className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">— select a template —</option>
              {eligibleOverrides.length > 0 && (
                <optgroup label={`Brand overrides (${eligibleOverrides.length})`}>
                  {eligibleOverrides.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {t.template_type}{t.platform ? ` · ${t.platform}` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label={`WV canon (${eligibleCanon.length})`}>
                {eligibleCanon.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.template_type}{t.platform ? ` · ${t.platform}` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <label className="mb-2 block text-sm font-semibold text-[#1C2B28]">Prompt</label>
            <p className="mb-3 text-xs text-[#6B7C79]">
              The assignment for this draft. Be specific about angle, audience focus, format hints. Voice profile + banned phrases auto-inject.
            </p>
            <textarea
              name="prompt"
              required
              rows={6}
              minLength={10}
              maxLength={8000}
              placeholder="e.g. Write about why Zakat is more than a tax — frame it around stewardship of wealth and intention (niyyah). Audience: Muslim professional in their 30s thinking about long-term planning."
              className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
            <p className="mt-2 text-xs text-[#6B7C79]">10-8000 chars · markdown OK</p>
          </section>

          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-xs text-[#6B7C79]">
              Calls Sonnet 4.6 (gen) + Haiku 4.5 (5-pillar score). ~$0.02-0.05 per draft. Wait ~10-30s.
            </p>
            <button
              type="submit"
              className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
            >
              Generate draft
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
