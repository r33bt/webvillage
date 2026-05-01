import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getAuthClient } from '@/lib/supabase-server'
import { getServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function SwitchPage() {
  const supabase = await getAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const currentTenantId = cookieStore.get('bh_current_tenant_id')?.value

  const sb = getServiceRoleClient()
  const { data: links } = await sb
    .from('wv_be_client_users')
    .select('client_id, role, wv_be_clients(id, display_name, current_tier, metadata)')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  type LinkRow = {
    client_id: string
    role: string
    wv_be_clients: {
      id: string
      display_name: string
      current_tier: string
      metadata: Record<string, unknown>
    } | null
  }

  const tenants = ((links ?? []) as unknown as LinkRow[]).flatMap((l) => {
    const c = l.wv_be_clients
    if (!c) return []
    return [{ id: c.id, displayName: c.display_name, tier: c.current_tier, slug: (c.metadata?.slug as string) ?? '', role: l.role }]
  })

  return (
    <div className="px-6 py-12 max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Switch brand</p>
      <h1 className="text-2xl font-semibold text-zinc-50 mb-8">Your brands</h1>
      <ul className="space-y-3">
        {tenants.map((t) => (
          <li key={t.id}>
            <form action="/app/switch/set" method="post">
              <input type="hidden" name="tenant_id" value={t.id} />
              <button
                type="submit"
                className={`w-full flex items-center justify-between gap-4 text-left rounded-xl border px-5 py-4 transition-colors ${
                  t.id === currentTenantId
                    ? 'border-zinc-600 bg-zinc-800'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">{t.displayName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t.slug} · {t.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">{t.tier.replace('_', ' ')}</span>
                  {t.id === currentTenantId && (
                    <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                  )}
                </div>
              </button>
            </form>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="/app" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Back to dashboard</Link>
      </div>
    </div>
  )
}