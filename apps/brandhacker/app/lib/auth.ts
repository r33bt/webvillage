import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthClient, createAdminClient } from './supabase-server'
import type { ClientRow } from './supabase'

export const TENANT_COOKIE = 'bh_current_tenant_id'

export async function getSession() {
  const supabase = await getAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Redirects to /login if no session. Use in Server Components + Route Handlers.
export async function getRequiredSession(currentPath = '/app') {
  const user = await getSession()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`)
  }
  return user
}

export async function getUserTenants(userId: string): Promise<(ClientRow & { current_tier: string })[]> {
  const admin = createAdminClient()

  const { data: userRows } = await admin
    .from('wv_be_client_users')
    .select('client_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .not('accepted_at', 'is', null)

  if (!userRows?.length) return []

  const clientIds = userRows.map((r: { client_id: string }) => r.client_id)

  const { data: clients } = await admin
    .from('wv_be_clients')
    .select('id, display_name, industry, metadata, updated_at, current_tier')
    .in('id', clientIds)
    .is('deleted_at', null)

  return (clients ?? []) as (ClientRow & { current_tier: string })[]
}

// Returns the active tenant ID — from cookie, or falls back to first available.
export async function getCurrentTenantId(userId: string): Promise<string | null> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(TENANT_COOKIE)?.value
  if (fromCookie) return fromCookie

  const tenants = await getUserTenants(userId)
  return tenants[0]?.id ?? null
}

export async function getCurrentTenant(
  userId: string
): Promise<(ClientRow & { current_tier: string }) | null> {
  const tenantId = await getCurrentTenantId(userId)
  if (!tenantId) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('wv_be_clients')
    .select('id, display_name, industry, metadata, updated_at, current_tier')
    .eq('id', tenantId)
    .single()

  return (data as (ClientRow & { current_tier: string })) ?? null
}
