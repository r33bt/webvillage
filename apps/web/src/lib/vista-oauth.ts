// apps/web/src/lib/vista-oauth.ts
// Slice 7 OAuth state-token helpers + token exchange.
// Per spec §2.1 — state is a signed JWT containing client_id + nonce + ts; HMAC verified on callback.

import crypto from 'crypto'

const STATE_TTL_MS = 10 * 60 * 1000  // 10-minute window per spec §2.1

interface OAuthState {
  client_id: string
  nonce: string
  ts: number
}

function getStateSecret(): string {
  const secret = process.env.VISTA_OAUTH_STATE_SECRET
  if (!secret) {
    throw new Error('VISTA_OAUTH_STATE_SECRET not set')
  }
  return secret
}

export function signOAuthState(clientId: string): string {
  const state: OAuthState = {
    client_id: clientId,
    nonce: crypto.randomBytes(16).toString('hex'),
    ts: Date.now(),
  }
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url')
  const sig = crypto.createHmac('sha256', getStateSecret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyOAuthState(stateToken: string): OAuthState {
  const [payload, sig] = stateToken.split('.')
  if (!payload || !sig) throw new Error('malformed_state')

  const expected = crypto.createHmac('sha256', getStateSecret()).update(payload).digest('base64url')
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error('invalid_state_signature')
  }

  let parsed: OAuthState
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    throw new Error('malformed_state_payload')
  }

  if (Date.now() - parsed.ts > STATE_TTL_MS) {
    throw new Error('state_expired')
  }
  if (typeof parsed.client_id !== 'string' || typeof parsed.nonce !== 'string') {
    throw new Error('malformed_state_fields')
  }
  return parsed
}

export interface OAuthExchangeResult {
  access_token: string
  refresh_token?: string
  expires_in: number  // seconds
  scope?: string
  workspace_id?: string  // Vista's workspace ID for the connected account
}

export async function exchangeAuthCode(code: string, redirectUri: string): Promise<OAuthExchangeResult> {
  const apiBase = process.env.VISTA_API_BASE_URL ?? 'https://api.vistasocial.com/v2'
  const clientId = process.env.VISTA_OAUTH_CLIENT_ID
  const clientSecret = process.env.VISTA_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret || clientId === 'TBD_FOUNDER_ACTION') {
    throw new Error('Vista OAuth client credentials not configured (founder action: register OAuth app at vistasocial.com → API)')
  }

  // VERIFY: exact token endpoint + form vs JSON body
  const resp = await fetch(`${apiBase}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  })

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '')
    throw new Error(`oauth_exchange_failed (${resp.status}): ${errBody.slice(0, 300)}`)
  }
  return (await resp.json()) as OAuthExchangeResult
}

export function buildAuthorizeUrl(state: string, redirectUri: string): string {
  const apiBase = process.env.VISTA_API_BASE_URL ?? 'https://api.vistasocial.com/v2'
  const clientId = process.env.VISTA_OAUTH_CLIENT_ID
  if (!clientId || clientId === 'TBD_FOUNDER_ACTION') {
    throw new Error('Vista OAuth client_id not configured')
  }
  // VERIFY: authorize endpoint URL + scope values
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    scope: 'workspace.read messages.read messages.write webhooks',
  })
  return `${apiBase}/oauth/authorize?${params.toString()}`
}
