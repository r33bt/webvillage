'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { encryptToken } from '@/lib/be-token-encryption'

export async function connectAyrshareProfile(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const profileKey = String(formData.get('profile_key') ?? '').trim()
  const externalProfileId = String(formData.get('external_profile_id') ?? '').trim()

  if (!clientId) throw new Error('Missing client_id')
  if (profileKey.length < 10) throw new Error('Profile key too short')

  const sb = createSupabaseServiceClient()
  const { error } = await sb
    .from('wv_be_platform_credentials')
    .upsert(
      {
        client_id: clientId,
        platform: 'ayrshare_linkedin',
        oauth_access_token_encrypted: encryptToken(profileKey),
        oauth_refresh_token_encrypted: null,
        oauth_expires_at: null,
        scope: 'ayrshare_profile_key',
        external_workspace_id: externalProfileId || null,
        last_refreshed_at: new Date().toISOString(),
        deleted_at: null,
      },
      { onConflict: 'client_id,platform' }
    )

  if (error) {
    redirect(`/admin/brand-engine/${clientId}/publishes/connect?error=${encodeURIComponent(error.message)}`)
  }

  await sb.from('wv_be_audit_log').insert({
    client_id: clientId,
    actor_user_id: null,
    actor_type: 'user',
    action: 'ayrshare_profile_connected',
    target_table: 'wv_be_platform_credentials',
    target_id: null,
    after_state: { external_profile_id: externalProfileId || null },
  })

  revalidatePath(`/admin/brand-engine/${clientId}/publishes`)
  revalidatePath(`/admin/brand-engine/${clientId}/publishes/connect`)
  redirect(`/admin/brand-engine/${clientId}/publishes?connected=ayrshare`)
}
