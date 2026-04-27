// apps/web/src/lib/ayrshare.ts
// Slice 8: Ayrshare API client. Single WV master key + per-brand profile_key (Q8-1 lock).
// VERIFY: exact endpoint paths + header names against Ayrshare docs at build time.

const API_BASE = process.env.AYRSHARE_API_BASE_URL ?? 'https://app.ayrshare.com/api'

export class AyrshareAPIError extends Error {
  constructor(public status: number, public detail: string, public retryAfterSec?: number) {
    super(`Ayrshare API ${status}: ${detail}`)
    this.name = 'AyrshareAPIError'
  }
}

export interface AyrsharePostArgs {
  profileKey: string  // per-brand
  body: string
  platforms: string[]  // e.g. ['linkedin']
  scheduleDate?: string  // ISO 8601 — if absent, publishes immediately
}

export interface AyrsharePostResult {
  ayrsharePostId: string  // ayr_*
  status: 'success' | 'error'
  postIds?: string[]  // platform-side IDs if immediate publish
  errors?: Array<{ code: string; message: string; platform?: string }>
  scheduleDate?: string
}

const REQUIRES_APPROVAL = false  // Q8-3: WE approve internally; don't double-gate via Ayrshare's approval system

export async function ayrsharePost(args: AyrsharePostArgs): Promise<AyrsharePostResult> {
  const apiKey = process.env.AYRSHARE_API_KEY
  if (!apiKey || apiKey === 'TBD_FOUNDER_ACTION') {
    throw new AyrshareAPIError(401, 'AYRSHARE_API_KEY not configured (founder action: ayrshare.com → API key)')
  }

  const body: Record<string, unknown> = {
    post: args.body,
    platforms: args.platforms,
    requiresApproval: REQUIRES_APPROVAL,
  }
  if (args.scheduleDate) body.scheduleDate = args.scheduleDate

  // VERIFY: exact endpoint + header name for profile_key
  const resp = await fetch(`${API_BASE}/post`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Profile-Key': args.profileKey,  // VERIFY: confirm header name with Ayrshare docs
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (resp.status === 429) {
    const retryAfter = parseInt(resp.headers.get('retry-after') ?? '60', 10)
    throw new AyrshareAPIError(429, 'rate limited', retryAfter)
  }
  if (resp.status >= 500) {
    const errBody = await resp.text().catch(() => '')
    throw new AyrshareAPIError(resp.status, errBody.slice(0, 500))
  }

  // 200 + maybe-error-in-body OR 4xx
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    throw new AyrshareAPIError(
      resp.status,
      typeof data?.message === 'string' ? data.message : JSON.stringify(data).slice(0, 500)
    )
  }

  // VERIFY: actual response shape — Ayrshare returns either { status: 'success', id, postIds, ... }
  // or { status: 'error', errors: [...] } in the 200 body.
  const status = data.status === 'error' ? 'error' : 'success'
  return {
    ayrsharePostId: data.id ?? data.ayrshare_post_id ?? `unknown_${Date.now()}`,
    status,
    postIds: data.postIds ?? undefined,
    errors: data.errors ?? undefined,
    scheduleDate: data.scheduleDate ?? undefined,
  }
}

// Retry-once-on-5xx wrapper per Q8-6
export async function ayrsharePostWithRetry(args: AyrsharePostArgs): Promise<{ result: AyrsharePostResult; retryCount: number }> {
  try {
    const result = await ayrsharePost(args)
    return { result, retryCount: 0 }
  } catch (err) {
    if (err instanceof AyrshareAPIError && err.status >= 500) {
      // Wait 30 sec then retry once
      await new Promise((r) => setTimeout(r, 30_000))
      const result = await ayrsharePost(args)
      return { result, retryCount: 1 }
    }
    throw err
  }
}
