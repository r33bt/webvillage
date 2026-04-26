import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface CanonRow {
  id: string
  phrase: string
  category: string | null
  severity: string
  rationale: string | null
  source_doc: string | null
  active: boolean
}

const CATEGORY_STYLE: Record<string, string> = {
  'AI-tell': 'bg-red-50 text-red-700 border border-red-200',
  'managerial-padding': 'bg-amber-50 text-amber-700 border border-amber-200',
  'narrative-register': 'bg-purple-50 text-purple-700 border border-purple-200',
  'corporate-cliche': 'bg-orange-50 text-orange-700 border border-orange-200',
  'self-positioning': 'bg-blue-50 text-blue-700 border border-blue-200',
}

export default async function BannedPhrasesCanonPage() {
  const sb = createSupabaseServiceClient()
  const { data, error } = await sb
    .from('wv_be_banned_phrases_canon')
    .select('*')
    .eq('active', true)
    .order('category')
    .order('phrase')

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-2xl font-bold text-[#1C2B28]">Banned-phrase canon</h1>
        <p className="font-mono text-sm text-red-700">{error.message}</p>
      </div>
    )
  }

  const rows = (data ?? []) as CanonRow[]
  const blockCount = rows.filter((r) => r.severity === 'block').length
  const flagCount = rows.filter((r) => r.severity === 'flag').length

  const byCategory: Record<string, CanonRow[]> = {}
  for (const r of rows) {
    const cat = r.category ?? 'uncategorised'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(r)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Brand Engine</p>
      <h1 className="mb-2 text-3xl font-bold text-[#1C2B28]">Banned-phrase canon</h1>
      <p className="mb-8 text-[#6B7C79]">
        Global anti-slop baseline applied to every draft generated on the platform. Per-client extensions live separately.
        <span className="ml-1 font-mono text-xs">{rows.length} active phrases · {blockCount} block · {flagCount} flag</span>
      </p>

      <div className="space-y-6">
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-[#1C2B28]">
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${CATEGORY_STYLE[category] ?? 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                  {category}
                </span>
              </h2>
              <span className="text-xs text-[#6B7C79]">{items.length} phrases</span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((r) => (
                <li key={r.id} className="flex items-baseline gap-2 text-sm">
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${r.severity === 'block' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {r.severity}
                  </span>
                  <span className="font-mono text-[#1C2B28]">"{r.phrase}"</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-[#6B7C79]">
        Source: <span className="font-mono">pb-editorial-anti-slop-overlay.md §5</span> · v4-ToV §D upstream for V22-substrate engagements
      </p>
    </div>
  )
}
