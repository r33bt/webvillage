import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Template {
  id: string
  template_type: string
  platform: string | null
  name: string
  body_template: string
  variables: Record<string, unknown>
  cluster_definition: Record<string, unknown> | null
  created_at: string
}

interface OverrideCount {
  source_template_id: string
  count: number
}

export default async function TemplatesCanonPage() {
  const sb = createSupabaseServiceClient()

  const [{ data: canon }, { data: overrides }] = await Promise.all([
    sb
      .from('wv_be_templates')
      .select('id, template_type, platform, name, body_template, variables, cluster_definition, created_at')
      .is('client_id', null)
      .eq('is_default', true)
      .is('deleted_at', null)
      .order('template_type', { ascending: true })
      .order('platform', { ascending: true, nullsFirst: false }),
    sb
      .from('wv_be_templates')
      .select('source_template_id')
      .not('client_id', 'is', null)
      .not('source_template_id', 'is', null)
      .is('deleted_at', null),
  ])

  const canonRows = (canon ?? []) as Template[]
  const overrideCounts = new Map<string, number>()
  for (const o of overrides ?? []) {
    if (o.source_template_id) {
      overrideCounts.set(o.source_template_id, (overrideCounts.get(o.source_template_id) ?? 0) + 1)
    }
  }

  // group by template_type
  const grouped = new Map<string, Template[]>()
  for (const r of canonRows) {
    const k = r.template_type
    if (!grouped.has(k)) grouped.set(k, [])
    grouped.get(k)!.push(r)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Templates canon</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">WV default templates</h1>
        <p className="text-sm text-[#6B7C79]">
          {canonRows.length} canonical templates · per-brand overrides shown alongside each row
        </p>
      </div>

      {Array.from(grouped.entries()).map(([type, rows]) => (
        <section key={type} className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">{type}</h2>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Platform</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Brand overrides</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">Body</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((r) => {
                  const oCount = overrideCounts.get(r.id) ?? 0
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5 font-medium text-[#1C2B28]">{r.name}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[#6B7C79]">{r.platform ?? '—'}</td>
                      <td className="px-4 py-2.5 text-xs">
                        {oCount > 0 ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
                            {oCount} brand{oCount === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="text-[#6B7C79]">—</span>
                        )}
                      </td>
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
        </section>
      ))}

      <p className="text-center text-xs text-[#6B7C79]">
        Per-brand templates live at{' '}
        <Link href="/admin/brand-engine" className="text-[#0F766E] hover:underline">
          /admin/brand-engine
        </Link>{' '}
        &rarr; pick client &rarr; Templates
      </p>
    </div>
  )
}
