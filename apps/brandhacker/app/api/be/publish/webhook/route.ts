/**
 * POST /api/be/publish/webhook
 * Ayrshare webhook callback handler — Slice 5.
 *
 * Ayrshare fires this endpoint when a scheduled post publishes (or fails).
 * Docs: https://docs.ayrshare.com/webhooks
 *
 * Flow:
 *  1.  Verify HMAC-SHA256 signature (x-ayrshare-signature header)
 *      Uses AYRSHARE_WEBHOOK_SECRET env var.
 *      If secret is not configured → log warning + process (dev mode).
 *  2.  Parse payload — structured as { action, id, postIds, errors, ... }
 *  3.  Look up wv_be_publishes by ayrshare_post_id (or id field)
 *  4.  Update publish row: status, published_at, response_payload
 *  5.  If published → patch linked draft: published_at, status='published'
 *  6.  Return 200 immediately in all cases (Ayrshare retries on non-2xx)
 *
 * Env vars:
 *   AYRSHARE_WEBHOOK_SECRET  -- HMAC secret set in Ayrshare dashboard
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * No new npm packages — uses built-in crypto for HMAC.
 */

import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { getServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Ayrshare webhook payload types
// ---------------------------------------------------------------------------

type AyrsharePostStatus = {
  platform: string
  id: string
  postUrl?: string
  status: 'success' | 'error' | 'scheduled'
  message?: string
}

type AyrshareWebhookPayload = {
  // "post" = immediate publish, "scheduled" = scheduled post completed
  action: 'post' | 'scheduled' | 'error' | string
  // Ayrshare's internal post ID (matches the id returned from POST /api/post)
  id: string
  postIds?: AyrsharePostStatus[]
  errors?: Array<{ platform: string; message: string }>
  // Post body text (echoed back)
  post?: string
  // When the post was published by Ayrshare
  created?: string
  // Refid if set at publish time
  refId?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// HMAC signature verification
// ---------------------------------------------------------------------------

/**
 * Ayrshare sends: x-ayrshare-signature: sha256=<hex>
 * We verify: HMAC-SHA256(rawBody, AYRSHARE_WEBHOOK_SECRET) == provided hex
 */
function verifyAyrshareSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false

  // Strip "sha256=" prefix if present
  const providedHex = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader

  const expectedHex = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')

  // Timing-safe compare to prevent timing attacks
  try {
    const a = Buffer.from(providedHex, 'hex')
    const b = Buffer.from(expectedHex, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Status resolution
// ---------------------------------------------------------------------------

/**
 * Map Ayrshare webhook action + per-platform statuses to our publish status.
 * If ANY platform reports success, we treat the overall publish as published.
 * Only if ALL platforms fail do we set status=failed.
 */
function resolvePublishStatus(
  action: string,
  postIds: AyrsharePostStatus[] | undefined,
  errors: Array<{ platform: string; message: string }> | undefined,
): 'published' | 'failed' | 'scheduled' {
  if (action === 'scheduled') return 'scheduled'

  if (!postIds || postIds.length === 0) {
    // No postIds + errors only → failed
    if (errors && errors.length > 0) return 'failed'
    // action=post with no postIds is ambiguous — default published
    return 'published'
  }

  const successCount = postIds.filter((p) => p.status === 'success').length
  if (successCount > 0) return 'published'

  return 'failed'
}

// ---------------------------------------------------------------------------
// POST /api/be/publish/webhook
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Read raw body (needed for HMAC)
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch (err) {
    console.error('[be/publish/webhook] failed to read request body', { error: String(err) })
    // Return 200 to prevent Ayrshare from retrying a bad request on our end
    return Response.json({ received: false, reason: 'body_read_error' }, { status: 200 })
  }

  // 2. Signature verification
  const webhookSecret = process.env.AYRSHARE_WEBHOOK_SECRET

  if (webhookSecret) {
    const sig = req.headers.get('x-ayrshare-signature')
    const valid = verifyAyrshareSignature(rawBody, sig, webhookSecret)
    if (!valid) {
      console.error('[be/publish/webhook] HMAC signature mismatch', {
        signature: sig?.slice(0, 20) ?? 'missing',
      })
      // Return 200 — Ayrshare retries on 4xx/5xx; a bad sig may be a misconfiguration,
      // not an attack. Log + drop is safer than creating a retry storm.
      return Response.json({ received: false, reason: 'invalid_signature' }, { status: 200 })
    }
  } else {
    console.warn(
      '[be/publish/webhook] AYRSHARE_WEBHOOK_SECRET not set — skipping signature verification (dev mode)',
    )
  }

  // 3. Parse payload
  let payload: AyrshareWebhookPayload
  try {
    payload = JSON.parse(rawBody) as AyrshareWebhookPayload
  } catch (err) {
    console.error('[be/publish/webhook] invalid JSON payload', { error: String(err) })
    return Response.json({ received: false, reason: 'invalid_json' }, { status: 200 })
  }

  const ayrsharePostId = payload.id
  if (!ayrsharePostId) {
    console.warn('[be/publish/webhook] payload missing id field', { action: payload.action })
    return Response.json({ received: true, skipped: true, reason: 'missing_id' }, { status: 200 })
  }

  const sb = getServiceRoleClient()

  // 4. Look up publish row by ayrshare_post_id
  const { data: publishRow, error: lookupErr } = await sb
    .from('wv_be_publishes')
    .select('id, status, draft_id, client_id')
    .eq('ayrshare_post_id', ayrsharePostId)
    .maybeSingle<{
      id: string
      status: string
      draft_id: string | null
      client_id: string
    }>()

  if (lookupErr) {
    console.error('[be/publish/webhook] publish lookup error', {
      ayrshare_post_id: ayrsharePostId,
      error: lookupErr.message,
    })
    // Return 200 to avoid retry storm — this is a DB error, not a bad webhook
    return Response.json({ received: true, skipped: true, reason: 'db_error' }, { status: 200 })
  }

  if (!publishRow) {
    // Possibly from a platform not using our system, or a race condition
    console.warn('[be/publish/webhook] no publish row found for ayrshare_post_id', {
      ayrshare_post_id: ayrsharePostId,
    })
    return Response.json(
      { received: true, skipped: true, reason: 'publish_not_found' },
      { status: 200 },
    )
  }

  // Skip if already terminal — idempotency guard
  if (publishRow.status === 'published' || publishRow.status === 'cancelled') {
    return Response.json(
      { received: true, skipped: true, reason: 'already_terminal', status: publishRow.status },
      { status: 200 },
    )
  }

  // 5. Resolve new status
  const newStatus = resolvePublishStatus(payload.action, payload.postIds, payload.errors)

  // Extract published_at — prefer Ayrshare's created timestamp
  const publishedAt =
    newStatus === 'published'
      ? (payload.created ? new Date(payload.created).toISOString() : new Date().toISOString())
      : null

  // 6. Update publish row
  const { error: updateErr } = await sb
    .from('wv_be_publishes')
    .update({
      status: newStatus,
      published_at: publishedAt,
      response_payload: payload as unknown as Record<string, unknown>,
    })
    .eq('id', publishRow.id)

  if (updateErr) {
    console.error('[be/publish/webhook] publish update error', {
      publish_id: publishRow.id,
      error: updateErr.message,
    })
    // Return 200 anyway — Ayrshare should not retry for a DB write failure on our side
    return Response.json({ received: true, skipped: true, reason: 'update_error' }, { status: 200 })
  }

  // 7. If published, patch draft
  if (newStatus === 'published' && publishRow.draft_id) {
    const { error: draftUpdateErr } = await sb
      .from('wv_be_drafts')
      .update({
        status: 'published',
        published_at: publishedAt,
      })
      .eq('id', publishRow.draft_id)
      .eq('client_id', publishRow.client_id)

    if (draftUpdateErr) {
      console.error('[be/publish/webhook] draft update error (non-fatal)', {
        draft_id: publishRow.draft_id,
        error: draftUpdateErr.message,
      })
    }
  }

  console.log('[be/publish/webhook] processed', {
    ayrshare_post_id: ayrsharePostId,
    publish_id: publishRow.id,
    action: payload.action,
    new_status: newStatus,
  })

  return Response.json({ received: true, publish_id: publishRow.id, status: newStatus })
}
