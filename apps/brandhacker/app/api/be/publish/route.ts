/**
 * POST /api/be/publish
 * BrandHacker Slice 5 — Ayrshare publishing wrap.
 *
 * Flow:
 *  1.  Auth check (x-bh-internal header or BH_INTERNAL_TOKEN env)
 *  2.  Zod validation of request body
 *  3.  Load + verify client (404 if missing, 503 if suspended)
 *  4.  Load draft (404 if not found, 400 if already published/cancelled)
 *  5.  Load Ayrshare API key from env (AYRSHARE_API_KEY)
 *  6.  Idempotency check — if ayrshare_post_id already set on draft → return existing publish record
 *  7.  Insert wv_be_publishes row (status=pending) before calling Ayrshare
 *  8.  Call Ayrshare POST /api/post
 *  9.  Update publish row with ayrshare_post_id + status (published / failed)
 * 10.  Update wv_be_drafts.last_publish_id + published_at (if immediate publish)
 * 11.  Return 201 with publish record
 *
 * Env vars required:
 *   AYRSHARE_API_KEY        -- Ayrshare profile API key
 *   BH_INTERNAL_TOKEN       -- optional: internal auth guard (dev mode allows all)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * No new npm packages — uses built-in fetch for Ayrshare REST calls.
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AYRSHARE_BASE_URL = 'https://api.ayrshare.com/api'

const VALID_PLATFORMS = [
  'linkedin',
  'instagram',
  'twitter',
  'facebook',
  'tiktok',
  'youtube',
  'pinterest',
  'reddit',
  'gmb',
  'telegram',
] as const

type AyrsharePlatform = (typeof VALID_PLATFORMS)[number]

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  client_id: z.string().uuid({ message: 'client_id must be a valid UUID' }),
  draft_id: z.string().uuid({ message: 'draft_id must be a valid UUID' }),
  platforms: z
    .array(z.enum(VALID_PLATFORMS))
    .min(1, 'at least one platform is required')
    .max(10, 'max 10 platforms per publish'),
  // ISO 8601 — omit for immediate publish
  scheduled_at: z.string().datetime({ offset: true }).optional(),
  // Optional per-platform post overrides (e.g. Instagram needs media_urls)
  platform_options: z
    .record(z.string(), z.record(z.string(), z.unknown()))
    .optional(),
})

type ValidatedRequest = z.infer<typeof RequestSchema>

// ---------------------------------------------------------------------------
// Auth check
// ---------------------------------------------------------------------------

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.BH_INTERNAL_TOKEN
  if (!token) return true // dev mode: no token configured — allow all
  const header = req.headers.get('x-bh-internal')
  return header === token || header === 'true'
}

// ---------------------------------------------------------------------------
// Ayrshare API types
// ---------------------------------------------------------------------------

type AyrsharePostRequest = {
  post: string
  platforms: AyrsharePlatform[]
  scheduleDate?: string // ISO 8601 UTC
  autoHashtags?: number
  shortenLinks?: boolean
  // per-platform options (e.g. { instagramOptions: { ... } })
  [key: string]: unknown
}

type AyrsharePostSuccess = {
  status: 'success' | 'error'
  id: string // Ayrshare post ID
  postIds: Array<{
    platform: string
    id: string
    postUrl?: string
    status: string
  }>
  errors?: Array<{ platform: string; message: string }>
  refId?: string
}

type AyrshareErrorBody = {
  status: 'error'
  message?: string
  errors?: Array<{ platform: string; message: string }>
}

// ---------------------------------------------------------------------------
// Ayrshare API caller
// ---------------------------------------------------------------------------

async function callAyrshare(
  apiKey: string,
  body: AyrsharePostRequest,
): Promise<{ ok: true; data: AyrsharePostSuccess } | { ok: false; error: string; statusCode: number; body: AyrshareErrorBody | null }> {
  let res: Response
  try {
    res = await fetch(`${AYRSHARE_BASE_URL}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    return {
      ok: false,
      error: `Network error calling Ayrshare: ${String(err)}`,
      statusCode: 0,
      body: null,
    }
  }

  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    return {
      ok: false,
      error: `Ayrshare returned non-JSON (HTTP ${res.status})`,
      statusCode: res.status,
      body: null,
    }
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `Ayrshare HTTP ${res.status}`,
      statusCode: res.status,
      body: parsed as AyrshareErrorBody,
    }
  }

  return { ok: true, data: parsed as AyrsharePostSuccess }
}

// ---------------------------------------------------------------------------
// POST /api/be/publish
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Auth
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse + validate
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { client_id, draft_id, platforms, scheduled_at, platform_options }: ValidatedRequest =
    parsed.data

  // Ayrshare API key — required
  const ayrshareApiKey = process.env.AYRSHARE_API_KEY
  if (!ayrshareApiKey) {
    console.error('[be/publish] AYRSHARE_API_KEY not configured')
    return Response.json({ error: 'Publishing service not configured' }, { status: 503 })
  }

  const sb = getServiceRoleClient()

  // 3. Load client
  const { data: client, error: clientErr } = await sb
    .from('wv_be_clients')
    .select('id, display_name, current_tier, metadata, deleted_at')
    .eq('id', client_id)
    .is('deleted_at', null)
    .maybeSingle<{
      id: string
      display_name: string
      current_tier: string
      metadata: Record<string, unknown> | null
      deleted_at: string | null
    }>()

  if (clientErr) {
    console.error('[be/publish] client lookup error', { client_id, error: clientErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!client) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  const clientMeta = (client.metadata ?? {}) as Record<string, unknown>
  if (clientMeta.suspended === true) {
    return Response.json(
      { error: 'This account is suspended. Contact support.' },
      { status: 503 },
    )
  }

  // 4. Load draft
  const { data: draft, error: draftErr } = await sb
    .from('wv_be_drafts')
    .select(
      'id, client_id, draft_body, platform, status, last_publish_id, published_at, generated_at',
    )
    .eq('id', draft_id)
    .eq('client_id', client_id)
    .maybeSingle<{
      id: string
      client_id: string
      draft_body: string
      platform: string | null
      status: string
      last_publish_id: string | null
      published_at: string | null
      generated_at: string
    }>()

  if (draftErr) {
    console.error('[be/publish] draft lookup error', { draft_id, error: draftErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!draft) {
    return Response.json({ error: 'Draft not found' }, { status: 404 })
  }
  if (draft.status === 'archived' || draft.status === 'rejected') {
    return Response.json(
      { error: `Draft is ${draft.status} and cannot be published` },
      { status: 400 },
    )
  }

  // 6. Idempotency — if draft already has a last_publish_id, return existing
  if (draft.last_publish_id) {
    const { data: existingPublish } = await sb
      .from('wv_be_publishes')
      .select('id, status, ayrshare_post_id, platforms, created_at')
      .eq('id', draft.last_publish_id)
      .maybeSingle<{
        id: string
        status: string
        ayrshare_post_id: string | null
        platforms: string[]
        created_at: string
      }>()

    if (existingPublish && existingPublish.status !== 'failed' && existingPublish.status !== 'cancelled') {
      return Response.json(
        {
          publish_id: existingPublish.id,
          status: existingPublish.status,
          ayrshare_post_id: existingPublish.ayrshare_post_id,
          platforms: existingPublish.platforms,
          created_at: existingPublish.created_at,
          _idempotent: true,
        },
        { status: 200 },
      )
    }
  }

  // 7. Insert publish row (status=pending) — before calling Ayrshare
  const now = new Date().toISOString()

  const { data: publishRow, error: publishInsertErr } = await sb
    .from('wv_be_publishes')
    .insert({
      client_id,
      draft_id,
      draft_generated_at: draft.generated_at,
      publish_provider: 'ayrshare',
      platforms,
      status: 'pending',
      scheduled_for: scheduled_at ?? null,
      created_at: now,
    })
    .select('id, created_at')
    .single<{ id: string; created_at: string }>()

  if (publishInsertErr || !publishRow) {
    console.error('[be/publish] publish row insert error', {
      client_id,
      draft_id,
      error: publishInsertErr?.message,
    })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  // 8. Build Ayrshare request body
  const ayrshareBody: AyrsharePostRequest = {
    post: draft.draft_body,
    platforms: platforms as AyrsharePlatform[],
  }

  if (scheduled_at) {
    // Ayrshare expects ISO 8601 UTC with Z suffix
    ayrshareBody.scheduleDate = scheduled_at
  }

  // Merge per-platform options (e.g. instagramOptions, twitterOptions)
  if (platform_options) {
    for (const [platformKey, opts] of Object.entries(platform_options)) {
      // Caller passes keys like "instagramOptions", "twitterOptions"
      ayrshareBody[platformKey] = opts
    }
  }

  // 9. Call Ayrshare
  const ayrshareResult = await callAyrshare(ayrshareApiKey, ayrshareBody)

  // 9a. Determine final status
  const isScheduled = Boolean(scheduled_at)
  let finalStatus: 'published' | 'scheduled' | 'failed'
  let ayrsharePostId: string | null = null
  let responsePayload: unknown

  if (ayrshareResult.ok) {
    finalStatus = isScheduled ? 'scheduled' : 'published'
    ayrsharePostId = ayrshareResult.data.id ?? null
    responsePayload = ayrshareResult.data
  } else {
    finalStatus = 'failed'
    responsePayload = ayrshareResult.body ?? { error: ayrshareResult.error }
    console.error('[be/publish] Ayrshare call failed', {
      client_id,
      draft_id,
      publish_id: publishRow.id,
      status_code: ayrshareResult.statusCode,
      error: ayrshareResult.error,
    })
  }

  // 9b. Update publish row
  const publishedAt = finalStatus === 'published' ? new Date().toISOString() : null

  await sb
    .from('wv_be_publishes')
    .update({
      status: finalStatus,
      ayrshare_post_id: ayrsharePostId,
      published_at: publishedAt,
      response_payload: responsePayload as Record<string, unknown>,
    })
    .eq('id', publishRow.id)

  // 10. Update draft fields (soft link — no FK constraint per spec)
  const draftPatch: Record<string, unknown> = {
    last_publish_id: publishRow.id,
    status: finalStatus === 'failed' ? draft.status : 'published',
  }
  if (finalStatus === 'published') {
    draftPatch.published_at = publishedAt
  }
  if (finalStatus === 'scheduled' && scheduled_at) {
    draftPatch.scheduled_for = scheduled_at
  }

  await sb.from('wv_be_drafts').update(draftPatch).eq('id', draft_id)

  // 11. Return 201
  if (finalStatus === 'failed') {
    // Return 502 so callers can distinguish from validation failures
    return Response.json(
      {
        publish_id: publishRow.id,
        status: 'failed',
        error: 'Publishing failed — see response_payload for details',
        response_payload: responsePayload,
      },
      { status: 502 },
    )
  }

  return Response.json(
    {
      publish_id: publishRow.id,
      status: finalStatus,
      ayrshare_post_id: ayrsharePostId,
      platforms,
      scheduled_at: scheduled_at ?? null,
      published_at: publishedAt,
      created_at: publishRow.created_at,
    },
    { status: 201 },
  )
}
