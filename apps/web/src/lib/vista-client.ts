// apps/web/src/lib/vista-client.ts
// Slice 7: Vista Social API client. Wraps fetch with auth header + 429 handling.
//
// VERIFY: exact endpoint paths and request body shapes against Vista API docs at build time
// (per spec Q7-1 — proceed on public docs; CSM call deferred). This file uses placeholder
// shapes from the spec; mark with VERIFY: comments where Vista docs need confirmation.

const API_BASE = process.env.VISTA_API_BASE_URL ?? 'https://api.vistasocial.com/v2'

export class VistaAPIError extends Error {
  constructor(public status: number, public detail: string, public retryAfterSec?: number) {
    super(`Vista API ${status}: ${detail}`)
    this.name = 'VistaAPIError'
  }
}

export interface SendMessageArgs {
  workspaceId: string
  replyToExternalId: string
  platform: 'linkedin'
  messageType: 'comment' | 'direct_message'
  body: string
  accessToken: string
}

export interface SendMessageResult {
  vistaReplyId: string
  externalUrl: string | null
}

export async function sendMessage(args: SendMessageArgs): Promise<SendMessageResult> {
  // VERIFY: exact endpoint + payload shape against Vista API docs
  const resp = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspace_id: args.workspaceId,
      reply_to: args.replyToExternalId,
      platform: args.platform,
      message_type: args.messageType,
      body: args.body,
    }),
  })

  if (resp.status === 429) {
    const retryAfter = parseInt(resp.headers.get('retry-after') ?? '60', 10)
    throw new VistaAPIError(429, 'rate limited', retryAfter)
  }

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '')
    throw new VistaAPIError(resp.status, errBody.slice(0, 500))
  }

  const data = (await resp.json()) as { id?: string; vista_reply_id?: string; external_url?: string; permalink?: string }
  // VERIFY: actual response shape — using lenient field name picks
  const vistaReplyId = data.vista_reply_id ?? data.id
  if (!vistaReplyId) {
    throw new VistaAPIError(500, 'Vista returned no reply id')
  }
  return {
    vistaReplyId,
    externalUrl: data.external_url ?? data.permalink ?? null,
  }
}

// OAuth token refresh — VERIFY against Vista docs for exact endpoint + grant_type
export interface RefreshTokenResult {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope?: string
}

export async function refreshOAuthToken(refreshToken: string): Promise<RefreshTokenResult> {
  const clientId = process.env.VISTA_OAUTH_CLIENT_ID
  const clientSecret = process.env.VISTA_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret || clientId === 'TBD_FOUNDER_ACTION') {
    throw new VistaAPIError(401, 'Vista OAuth client credentials not configured (founder action: ideogram-style key from Vista dashboard)')
  }

  // VERIFY: token endpoint URL + form vs JSON body
  const resp = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  })

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '')
    throw new VistaAPIError(resp.status, `refresh_failed: ${errBody.slice(0, 300)}`)
  }
  return (await resp.json()) as RefreshTokenResult
}

// Mark-read endpoint per Q7-12 — VERIFY existence with Vista docs; gracefully no-op if not present
export async function markEventRead(args: { externalId: string; accessToken: string }): Promise<{ ok: boolean; supported: boolean }> {
  // VERIFY: Vista API may or may not expose this. If 404, treat as "not supported" and return gracefully.
  try {
    const resp = await fetch(`${API_BASE}/messages/${encodeURIComponent(args.externalId)}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${args.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    })
    if (resp.status === 404) return { ok: false, supported: false }
    if (!resp.ok) {
      console.warn('[vista mark-read] unexpected status:', resp.status)
      return { ok: false, supported: true }
    }
    return { ok: true, supported: true }
  } catch (err) {
    console.warn('[vista mark-read] error:', err)
    return { ok: false, supported: false }
  }
}
