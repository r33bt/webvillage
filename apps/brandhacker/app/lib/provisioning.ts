import { createAdminClient } from './supabase-server'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Called once on first successful sign-in.
// Returns the client_id for the new (or existing) tenant.
export async function provisionTenant(userId: string, email: string): Promise<string | null> {
  const admin = createAdminClient()

  // Check if user already has a linked tenant (dogfood seed or prior signup)
  const { data: existing } = await admin
    .from('wv_be_client_users')
    .select('client_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .not('accepted_at', 'is', null)
    .limit(1)
    .maybeSingle()

  if (existing) return existing.client_id

  const emailPrefix = email.split('@')[0] ?? 'brand'
  const displayName = emailPrefix
  const slug = slugify(emailPrefix) || `brand-${Date.now()}`

  const { data: client, error } = await admin
    .from('wv_be_clients')
    .insert({
      display_name: displayName,
      current_tier: 'free',
      lifecycle_stage: 'onboarding',
      metadata: { slug },
    })
    .select('id')
    .single()

  if (error || !client) {
    console.error('[provisioning] Failed to create client:', error?.message)
    return null
  }

  await admin.from('wv_be_client_users').insert({
    client_id: client.id,
    user_id: userId,
    role: 'admin',
    accepted_at: new Date().toISOString(),
  })

  return client.id
}
