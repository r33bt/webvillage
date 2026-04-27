import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { createCluster } from './actions'

export const dynamic = 'force-dynamic'

export default async function NewClusterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error: errorParam } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: voice }, { data: clusterTemplates }, { data: contentTemplates }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb.from('wv_be_voice_profiles').select('id, version').eq('client_id', id).maybeSingle(),
    sb
      .from('wv_be_templates')
      .select('id, name')
      .eq('template_type', 'cluster')
      .or(`client_id.is.null,client_id.eq.${id}`)
      .is('deleted_at', null),
    sb
      .from('wv_be_templates')
      .select('id, name, template_type')
      .neq('template_type', 'cluster')
      .neq('template_type', 'banner')
      .or(`client_id.is.null,client_id.eq.${id}`)
      .is('deleted_at', null)
      .order('template_type', { ascending: true }),
  ])

  if (!client) notFound()

  const initialSlotCount = 5

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/clusters`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; All clusters
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">New cluster</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
        {!voice && (
          <p className="text-sm text-amber-700">
            ⚠ No voice profile.{' '}
            <Link href={`/admin/brand-engine/${id}/voice`} className="underline">
              Create one first
            </Link>
            .
          </p>
        )}
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-1 font-semibold">Create failed</p>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
        </div>
      )}

      {!voice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">Voice profile required.</div>
      ) : (
        <form action={createCluster} className="space-y-6">
          <input type="hidden" name="client_id" value={id} />

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-[#1C2B28]">Cluster meta</h2>
            <div className="space-y-4">
              <FieldText name="name" label="Name" placeholder="e.g. Q3 Zakat Planning Pillar" required />
              <FieldArea name="theme" label="Theme" placeholder="The cluster's editorial theme" required />
              <FieldArea name="target_audience" label="Target audience" placeholder="Who this cluster is for" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">Arc type</label>
                  <select name="arc_type" defaultValue="" className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option value="">Free-form (no arc)</option>
                    <option value="linear">Linear (setup → development → payoff)</option>
                    <option value="episodic">Episodic (each slot stands alone)</option>
                    <option value="evergreen">Evergreen (timeless reference)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">Cluster template (optional default for slots)</label>
                  <select name="cluster_template_id" defaultValue="" className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option value="">— none (each slot must specify) —</option>
                    {(contentTemplates ?? []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.template_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-bold text-[#1C2B28]">Slots</h2>
            <p className="mb-4 text-xs text-[#6B7C79]">
              Each slot becomes a draft. Sibling titles are injected into each slot's prompt for peer-awareness. Max 20 slots.
            </p>
            <div className="space-y-3">
              {Array.from({ length: initialSlotCount }).map((_, i) => (
                <SlotRow key={i} index={i + 1} contentTemplates={(contentTemplates ?? []) as { id: string; name: string; template_type: string }[]} />
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-xs text-[#6B7C79]">
              Estimated cost: ~$0.04 per slot (Sonnet 4.6 + Haiku 4.5). Soft warning at 50¢ / hard cap at $1.00.
            </p>
            <button type="submit" className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d655d]">
              Create cluster
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function FieldText({ name, label, placeholder, required }: { name: string; label: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="form-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
      />
    </div>
  )
}

function FieldArea({ name, label, placeholder, required }: { name: string; label: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        required={required}
        rows={2}
        placeholder={placeholder}
        className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
      />
    </div>
  )
}

function SlotRow({ index, contentTemplates }: { index: number; contentTemplates: { id: string; name: string; template_type: string }[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/30 p-3">
      <p className="mb-2 text-xs font-semibold text-[#6B7C79]">Slot {index}</p>
      <div className="grid gap-2 sm:grid-cols-12">
        <input
          name="slot_topic[]"
          placeholder="Title (peer slots see this)"
          className="form-input rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:col-span-5"
        />
        <select name="slot_arc_role[]" defaultValue="" className="form-select rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:col-span-3">
          <option value="">— role (optional) —</option>
          <option value="setup">setup</option>
          <option value="development">development</option>
          <option value="payoff">payoff</option>
          <option value="evergreen">evergreen</option>
        </select>
        <select name="slot_template_id[]" defaultValue="" className="form-select rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:col-span-4">
          <option value="">— template (else cluster default) —</option>
          {contentTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="slot_brief[]"
        rows={2}
        placeholder="Brief — what to write (2-5 sentences; angle, key claims, target reader)"
        className="form-textarea mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      />
    </div>
  )
}
