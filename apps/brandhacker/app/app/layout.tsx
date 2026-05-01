import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getAuthClient } from '@/lib/supabase-server'
import { getServiceRoleClient } from '@/lib/supabase'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cookieStore = await cookies()
  const currentTenantId = cookieStore.get('bh_current_tenant_id')?.value

  const sb = getServiceRoleClient()
  const { data: tenantLinks } = await sb
    .from('wv_be_client_users')
    .select('client_id, role, wv_be_clients(id, display_name, current_tier, metadata)')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  type TenantLink = {
    client_id: string
    role: string
    wv_be_clients: {
      id: string
      display_name: string
      current_tier: string
      metadata: Record<string, unknown>
    } | null
  }

  const tenants = ((tenantLinks ?? []) as unknown as TenantLink[]).flatMap((link) => {
    const c = link.wv_be_clients
    if (!c) return []
    return [
      {
        id: c.id,
        displayName: c.display_name,
        tier: c.current_tier,
        slug: (c.metadata?.slug as string) ?? '',
      },
    ]
  })

  const current = tenants.find((t) => t.id === currentTenantId) ?? tenants[0]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <nav className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-50 shrink-0"
          >
            BrandHacker
          </Link>
          {current && (
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <Link
                href={`/app/calendar/${current.slug}`}
                className="hover:text-zinc-200 transition-colors"
              >
                Calendar
              </Link>
              <Link
                href={`/app/strategy/${current.slug}`}
                className="hover:text-zinc-200 transition-colors"
              >
                Strategy
              </Link>
              {tenants.length > 1 && (
                <Link
                  href="/app/switch"
                  className="hover:text-zinc-200 transition-colors"
                >
                  Switch brand
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {current && (
            <span className="text-sm text-zinc-400">{current.displayName}</span>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500 rounded"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="min-h-[calc(100vh-49px)]">{children}</main>
    </div>
  )
}
