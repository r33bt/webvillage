import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Client {
  id: string
  display_name: string
  legal_entity_name: string | null
  primary_domain: string | null
  industry: string | null
  current_tier: string
  lifecycle_stage: string | null
  outreach_addon_active: boolean
  trial_ends_at: string | null
  brand_engine_intake_completed_at: string | null
  created_at: string
  updated_at: string
}

const TIER_LABEL: Record<string, string> = {
  free_trial: 'Free trial',
  tool_starter: 'Tool Starter',
  tool_pro: 'Tool Pro',
  editorial_lite: 'Editorial Lite',
  editorial_growth: 'Editorial Growth',
  editorial_brand: 'Editorial Brand',
  editorial_enterprise: 'Editorial Enterprise',
}

const TIER_PRICE: Record<string, string> = {
  free_trial: 'Trial',
  tool_starter: '$99/mo',
  tool_pro: '$249/mo',
  editorial_lite: '$599/mo',
  editorial_growth: '$1,799/mo',
  editorial_brand: '$5,999/mo',
  editorial_enterprise: '$15K+/mo',
}

const LIFECYCLE_STYLE: Record<string, string> = {
  onboarding: 'bg-amber-50 text-amber-700 border border-amber-200',
  activated: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  at_risk: 'bg-orange-50 text-orange-700 border border-orange-200',
  churned: 'bg-slate-100 text-slate-600 border border-slate-200',
}

export default async function BrandEngineClientsPage() {
  const supabase = createSupabaseServiceClient()
  const { data: clients, error } = await supabase
    .from('wv_be_clients')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-3 text-2xl font-bold text-[#1C2B28]">Brand Engine · Clients</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">Failed to load clients</p>
          <p className="mt-2 font-mono text-sm text-red-700">{error.message}</p>
          <p className="mt-3 text-sm text-red-700">
            Likely missing env vars on this deployment: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
          </p>
        </div>
      </div>
    )
  }

  const list = (clients ?? []) as Client[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Brand Engine</p>
          <h1 className="text-3xl font-bold text-[#1C2B28]">Clients</h1>
          <p className="mt-1 text-[#6B7C79]">
            {list.length} client{list.length === 1 ? '' : 's'} on the platform.
            <span className="ml-2 font-mono text-xs text-[#6B7C79]">EVA Platform · wv_be_clients</span>
          </p>
        </div>
        <button
          disabled
          className="cursor-not-allowed rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#6B7C79]"
          title="Onboarding intake comes in Phase B"
        >
          + New client
        </button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-[#6B7C79]">
          No clients yet. Run the seed insert to register the first ones.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">
                <th className="px-4 py-3">Display name</th>
                <th className="px-4 py-3">Legal entity</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Lifecycle</th>
                <th className="px-4 py-3">Intake</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/brand-engine/${c.id}`} className="font-semibold text-[#1C2B28] underline-offset-2 hover:text-[#0F766E] hover:underline">
                      {c.display_name}
                    </Link>
                    {c.primary_domain && (
                      <p className="mt-0.5 font-mono text-xs text-[#6B7C79]">{c.primary_domain}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#6B7C79]">{c.legal_entity_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#F0FAF9] px-2 py-0.5 text-xs font-semibold text-[#0F766E]">
                      {TIER_LABEL[c.current_tier] ?? c.current_tier}
                    </span>
                    <p className="mt-0.5 text-xs text-[#6B7C79]">{TIER_PRICE[c.current_tier] ?? ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.lifecycle_stage ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LIFECYCLE_STYLE[c.lifecycle_stage] ?? ''}`}>
                        {c.lifecycle_stage}
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B7C79]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7C79]">
                    {c.brand_engine_intake_completed_at ? '✓ done' : 'pending'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#6B7C79]">
                    {new Date(c.created_at).toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 text-sm text-[#6B7C79]">
        Phase A (this session): tenancy + voice substrate schema deployed (9 tables, 13 RLS policies, pgvector). Onboarding intake, voice profile capture, and per-client management arrive in Phase B.
      </p>
    </div>
  )
}
