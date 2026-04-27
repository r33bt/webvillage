import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { connectAyrshareProfile } from './actions'

export const dynamic = 'force-dynamic'

export default async function ConnectAyrsharePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error: errorParam } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: existing }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_platform_credentials')
      .select('id, external_workspace_id, last_refreshed_at')
      .eq('client_id', id)
      .eq('platform', 'ayrshare_linkedin')
      .is('deleted_at', null)
      .maybeSingle(),
  ])

  if (!client) notFound()

  const masterKeyConfigured =
    process.env.AYRSHARE_API_KEY && process.env.AYRSHARE_API_KEY !== 'TBD_FOUNDER_ACTION'

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/publishes`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Publishes
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Connect Ayrshare</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
        </div>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-bold text-[#1C2B28]">What this does</h2>
        <ul className="space-y-2 text-sm text-[#6B7C79]">
          <li>1. Per-brand Ayrshare profile_key links this brand to its LinkedIn account</li>
          <li>2. WV master Ayrshare API key handles auth (one subscription, billed centrally)</li>
          <li>3. Publishes from this brand fan out to the connected LinkedIn account via Ayrshare</li>
          <li>4. Status webhooks update <span className="font-mono text-xs">wv_be_publishes</span> rows</li>
        </ul>
      </section>

      {!masterKeyConfigured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="mb-2 font-semibold">Ayrshare master key not configured.</p>
          <p>Founder action required:</p>
          <ol className="mt-2 list-decimal pl-5 space-y-1">
            <li>Sign up at <span className="font-mono text-xs">ayrshare.com</span></li>
            <li>Get the master API key from dashboard → API</li>
            <li>Set webhook URL: <span className="font-mono text-xs">https://webvillage.com/api/be/publish/ayrshare/webhook</span></li>
            <li>Configure webhook signing secret matching <span className="font-mono text-xs">AYRSHARE_WEBHOOK_SECRET</span> env var</li>
            <li>Update Vercel env <span className="font-mono text-xs">AYRSHARE_API_KEY</span> with real value (currently placeholder)</li>
          </ol>
        </div>
      ) : existing ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          <p className="mb-2 font-semibold">Ayrshare profile connected.</p>
          <p>External profile ID: <span className="font-mono text-xs">{existing.external_workspace_id ?? '(not set)'}</span></p>
          <p className="mt-1">Last refreshed: <span className="font-mono text-xs">{existing.last_refreshed_at ? new Date(existing.last_refreshed_at as string).toISOString().slice(0, 16) : '—'}</span></p>
          <p className="mt-3">
            <Link href={`/admin/brand-engine/${id}/publishes`} className="text-[#0F766E] hover:underline">
              Back to publishes &rarr;
            </Link>
          </p>
        </div>
      ) : (
        <form action={connectAyrshareProfile} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <input type="hidden" name="client_id" value={id} />
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">Profile key (from Ayrshare dashboard)</label>
            <p className="mb-2 text-xs text-[#6B7C79]">Paste the per-brand profile_key generated in Ayrshare for this brand's LinkedIn account.</p>
            <input
              name="profile_key"
              required
              minLength={10}
              type="password"
              className="form-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">External profile ID (optional)</label>
            <p className="mb-2 text-xs text-[#6B7C79]">Ayrshare's profile ID — used to map webhooks back to this brand.</p>
            <input
              name="external_profile_id"
              className="form-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>
          <div className="flex items-center justify-end border-t border-slate-200 pt-4">
            <button type="submit" className="rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d655d]">
              Connect profile
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
