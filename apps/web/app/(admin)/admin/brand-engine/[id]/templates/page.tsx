import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Template {
  id: string
  client_id: string | null
  template_type: string
  platform: string | null
  name: string
  body_template: string
  variables: Record<string, unknown>
  cluster_definition: Record<string, unknown> | null
  is_default: boolean
  source_template_id: string | null
  created_at: string
}

export default async function ClientTemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: clientOverrides }, { data: canon }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_templates')
      .select('*')
      .eq('client_id', id)
      .is('deleted_at', null)
      .order('template_type', { ascending: true }),
    sb
      .from('wv_be_templates')
      .select('*')
      .is('client_id', null)
      .eq('is_default', true)
      .is('deleted_at', null)
      .order('template_type', { ascending: true }),
  ])

  if (!client) notFound()

  const overrides = (clientOverrides ?? []) as Template[]
  const canonRows = (canon ?? []) as Template[]
  const overriddenCanonIds = new Set(overrides.map((o) => o.source_template_id).filter(Boolean))

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Templates</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
        <p className="text-sm text-[#6B7C79]">
          {overrides.length} brand override{overrides.length === 1 ? '' : 's'} ·{' '}
          {canonRows.length} WV canon default{canonRows.length === 1 ? '' : 's'} available
        </p>
      </div>

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">Brand overrides</h2>
          <span className="text-xs text-[#6B7C79]">Tuned for this brand · supersedes canon when present</span>
        </div>

        {overrides.length > 0 ? (
          <TemplateTable rows={overrides} clientId={id} showSource canonRows={canonRows} />
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No brand overrides yet. This client uses WV canon defaults below.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#1C2B28]">WV canon defaults</h2>
          <Link href="/admin/templates-canon" className="text-xs text-[#0F766E] hover:underline">
            Read-only view across all clients &rarr;
          </Link>
        </div>

        <TemplateTable rows={canonRows} clientId={id} overriddenIds={overriddenCanonIds} />
      </section>
    </div>
  )
}

function TemplateTable({
  rows,
  clientId,
  showSource = false,
  overriddenIds,
  canonRows,
}: {
  rows: Template[]
  clientId: string
  showSource?: boolean
  overriddenIds?: Set<string | null>
  canonRows?: Template[]
}) {
  const canonById = new Map((canonRows ?? []).map((c) => [c.id, c]))

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Name</th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Type</th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Platform</th>
            {showSource && (
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Overrides</th>
            )}
            <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Body</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => {
            const isOverridden = overriddenIds?.has(r.id) ?? false
            return (
              <tr key={r.id} className={isOverridden ? 'bg-slate-50/50' : ''}>
                <td className="px-4 py-2.5 text-[#1C2B28]">
                  <div className="font-medium">{r.name}</div>
                  {isOverridden && (
                    <div className="mt-0.5 text-xs text-amber-700">Overridden by brand variant</div>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-[#6B7C79]">{r.template_type}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-[#6B7C79]">{r.platform ?? '—'}</td>
                {showSource && (
                  <td className="px-4 py-2.5 text-xs text-[#6B7C79]">
                    {r.source_template_id && canonById.has(r.source_template_id) ? (
                      <span>&larr; {canonById.get(r.source_template_id)!.name}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                )}
                <td className="px-4 py-2.5 text-right">
                  <details className="inline-block">
                    <summary className="cursor-pointer text-xs font-medium text-[#0F766E] hover:underline">View</summary>
                    <div className="mt-3 max-w-3xl space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">body_template</p>
                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-[#1C2B28]">
                          {r.body_template}
                        </pre>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">variables</p>
                        <pre className="overflow-auto rounded bg-white p-3 text-xs text-[#1C2B28]">
                          {JSON.stringify(r.variables, null, 2)}
                        </pre>
                      </div>
                      {r.cluster_definition && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">cluster_definition</p>
                          <pre className="overflow-auto rounded bg-white p-3 text-xs text-[#1C2B28]">
                            {JSON.stringify(r.cluster_definition, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
