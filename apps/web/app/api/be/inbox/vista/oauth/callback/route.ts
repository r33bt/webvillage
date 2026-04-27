// apps/web/app/api/be/inbox/vista/oauth/callback/route.ts
// Slice 7 OAuth callback — verifies state, exchanges code, persists encrypted tokens.

import { NextRequest, NextResponse } from 'next/server'
import { verifyOAuthState, exchangeAuthCode } from '@/lib/vista-oauth'
import { encryptToken } from '@/lib/be-token-encryption'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateToken = url.searchParams.get('state')
  const errParam = url.searchParams.get('error')

  if (errParam) {
    return NextResponse.json({ error: 'oauth_provider_error', detail: errParam }, { status: 400 })
  }
  if (!code || !stateToken) {
    return NextResponse.json({ error: 'missing_code_or_state' }, { status: 400 })
  }

  // Verify state
  let state
  try {
    state = verifyOAuthState(stateToken)
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_state', detail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }

  // Build same redirect URI used in start
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const redirectUri = `${proto}://${host}/api/be/inbox/vista/oauth/callback`

  // Exchange code
  let tokenResult
  try {
    tokenResult = await exchangeAuthCode(code, redirectUri)
  } catch (err) {
    return NextResponse.json(
      { error: 'oauth_exchange_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  // Persist
  const sb = createSupabaseServiceClient()
  const expiresAt = new Date(Date.now() + tokenResult.expires_in * 1000).toISOString()
  const { error: insertErr } = await sb
    .from('wv_be_platform_credentials')
    .upsert({
      client_id: state.client_id,
      platform: 'vista_linkedin',
      oauth_access_token_encrypted: encryptToken(tokenResult.access_token),
      oauth_refresh_token_encrypted: tokenResult.refresh_token ? encryptToken(tokenResult.refresh_token) : null,
      oauth_expires_at: expiresAt,
      scope: tokenResult.scope ?? null,
      external_workspace_id: tokenResult.workspace_id ?? null,
      last_refreshed_at: new Date().toISOString(),
      deleted_at: null,
    }, { onConflict: 'client_id,platform' })

  if (insertErr) {
    return NextResponse.json(
      { error: 'token_persist_failed', detail: insertErr.message },
      { status: 500 }
    )
  }

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: state.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'vista_oauth_connected',
    target_table: 'wv_be_platform_credentials',
    target_id: null,
    after_state: { workspace_id: tokenResult.workspace_id ?? null, scope: tokenResult.scope ?? null, expires_in: tokenResult.expires_in },
  })

  return NextResponse.redirect(`${proto}://${host}/admin/brand-engine/${state.client_id}/inbox?connected=vista`, { status: 302 })
}
