// apps/web/app/api/be/publish/route.ts
// Slice 8: POST creates a publish (immediate via Ayrshare or scheduled via wv_be_jobs queue).

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { decryptToken } from '@/lib/be-token-encryption'
import { ayrsharePostWithRetry, AyrshareAPIError } from '@/lib/ayrshare'
import { ayrsharePostCostCents } from '@/lib/ayrshare-pricing'
import { checkPublishCap } from '@/lib/be-publish-cap'

export const runtime = 'nodejs'
export const maxDuration = 60

const PHASE_1_PLATFORMS = ['linkedin'] as const

const RequestSchema = z.object({
  draft_id: z.string().uuid(),
  platforms: z.array(z.enum(PHASE_1_PLATFORMS)).min(1).max(1),
  scheduled_for: z.string().datetime().nullable().optional(),
  override_body: z.string().max(10000).optional(),
  founder_note: z.string().max(500).optional(),
  parent_publish_id: z.string().uuid().optional(),
})

interface DraftRow {
  id: string
  client_id: string
  status: string
  draft_body: string
  generated_at: string
  published_at: string | null
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RequestSchema>
  try {
    body = RequestSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Phase 1: linkedin only — Zod already restricts; no separate 415 needed (validation rejects upstream)

  // Schedule deadline check: if scheduled_for is set, must be > now() + 60s (Q8-4)
  let scheduledForIso: string | null = null
  if (body.scheduled_for) {
    const sf = new Date(body.scheduled_for)
    if (sf.getTime() < Date.now() + 60_000) {
      return NextResponse.json({ error: 'scheduled_too_soon', detail: 'scheduled_for must be > now() + 60s' }, { status: 400 })
    }
    scheduledForIso = sf.toISOString()
  }

  const sb = createSupabaseServiceClient()

  // Fetch draft
  const { data: draft } = await sb
    .from('wv_be_drafts')
    .select('id, client_id, status, draft_body, generated_at, published_at')
    .eq('id', body.draft_id)
    .single()
  if (!draft) return NextResponse.json({ error: 'draft_not_found' }, { status: 404 })

  const d = draft as DraftRow

  // Eligibility gate (Q8-3): only approved or edited drafts publishable
  if (!['approved', 'edited'].includes(d.status)) {
    return NextResponse.json(
      { error: 'draft_not_publishable', detail: `status=${d.status}; must be approved or edited`, hint: 'Flip status in drafts UI first' },
      { status: 412 }
    )
  }

  // Already-published gate (requires explicit parent_publish_id to republish per §2.3)
  if (d.published_at && !body.parent_publish_id) {
    return NextResponse.json(
      { error: 'already_published', detail: 'Set parent_publish_id to republish' },
      { status: 409 }
    )
  }

  // Volume cap (Q8-7)
  const cap = await checkPublishCap(d.client_id)
  if (cap.status === 'hard_cap_exceeded') {
    return NextResponse.json(
      { error: 'volume_cap_exceeded', current_count: cap.current_count, hard_cap: cap.hard_cap, retry_after_iso: cap.retry_after_iso, cap_exceeded: true },
      { status: 429 }
    )
  }

  // Fetch Ayrshare credential for first platform (Slice 8 phase 1: only linkedin)
  const platform = body.platforms[0]!
  const credPlatformKey = `ayrshare_${platform}`
  const { data: cred } = await sb
    .from('wv_be_platform_credentials')
    .select('id, oauth_access_token_encrypted, external_workspace_id')
    .eq('client_id', d.client_id)
    .eq('platform', credPlatformKey)
    .is('deleted_at', null)
    .maybeSingle()

  if (!cred) {
    return NextResponse.json(
      { error: 'ayrshare_not_connected', detail: `Connect Ayrshare profile for ${platform} first`, platform },
      { status: 412 }
    )
  }

  let profileKey: string
  try {
    profileKey = decryptToken(cred.oauth_access_token_encrypted as string)
  } catch (err) {
    return NextResponse.json(
      { error: 'profile_key_decrypt_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  const finalBody = body.override_body ?? d.draft_body
  const baseMetadata: Record<string, unknown> = {
    founder_note: body.founder_note ?? null,
    profile_external_id: cred.external_workspace_id ?? null,
  }

  // Branch: scheduled vs immediate
  if (scheduledForIso) {
    // Insert wv_be_publishes row with status='queued' + wv_be_jobs row
    const { data: pub, error: pubErr } = await sb
      .from('wv_be_publishes')
      .insert({
        draft_id: d.id,
        draft_generated_at: d.generated_at,
        client_id: d.client_id,
        platform,  // legacy single col
        platforms: [platform],
        publish_provider: 'ayrshare',
        scheduled_for: scheduledForIso,
        status: 'queued',
        metadata: baseMetadata,
        platform_credential_id: cred.id,
        parent_publish_id: body.parent_publish_id ?? null,
      })
      .select('id, created_at')
      .single()

    if (pubErr || !pub) {
      return NextResponse.json({ error: 'publish_persist_failed', detail: pubErr?.message }, { status: 500 })
    }

    // Enqueue cron job
    await sb.from('wv_be_jobs').insert({
      client_id: d.client_id,
      job_type: 'publish',
      payload: {
        publish_id: pub.id,
        draft_id: d.id,
        client_id: d.client_id,
        platforms: [platform],
        override_body: body.override_body ?? null,
        scheduled_for: scheduledForIso,
        platform_credential_id: cred.id,
      },
      status: 'pending',
    })

    // Update draft.scheduled_for + last_publish_id
    await sb
      .from('wv_be_drafts')
      .update({ scheduled_for: scheduledForIso, last_publish_id: pub.id })
      .eq('id', d.id)

    // Audit
    await sb.from('wv_be_audit_log').insert({
      client_id: d.client_id,
      actor_user_id: null,
      actor_type: 'user',
      action: 'publish_initiated',
      target_table: 'wv_be_publishes',
      target_id: pub.id,
      after_state: { status: 'queued', scheduled_for: scheduledForIso, platforms: [platform] },
    })

    return NextResponse.json({
      publish_id: pub.id,
      status: 'queued',
      scheduled_for: scheduledForIso,
      platforms: [platform],
      cap_status: cap.status,
    })
  }

  // Immediate publish: fire Ayrshare now
  let ayrResult, retryCount = 0
  try {
    const r = await ayrsharePostWithRetry({
      profileKey,
      body: finalBody,
      platforms: [platform],
    })
    ayrResult = r.result
    retryCount = r.retryCount
  } catch (err) {
    if (err instanceof AyrshareAPIError) {
      // Persist failed publish row
      const { data: pubFail } = await sb
        .from('wv_be_publishes')
        .insert({
          draft_id: d.id,
          draft_generated_at: d.generated_at,
          client_id: d.client_id,
          platform,
          platforms: [platform],
          publish_provider: 'ayrshare',
          status: 'failed',
          failure_reason: `${err.status}: ${err.detail.slice(0, 200)}`,
          metadata: { ...baseMetadata, ayrshare_error: { status: err.status, detail: err.detail } },
          platform_credential_id: cred.id,
          parent_publish_id: body.parent_publish_id ?? null,
          retry_count: retryCount,
        })
        .select('id')
        .single()

      const httpStatus = err.status >= 500 ? 502 : err.status === 429 ? 503 : 422
      return NextResponse.json({ error: 'ayrshare_failed', status: err.status, detail: err.detail, publish_id: pubFail?.id }, { status: httpStatus })
    }
    return NextResponse.json({ error: 'publish_failed', detail: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }

  // Success path — persist row
  const isSuccess = ayrResult.status === 'success'
  const { data: pubRow, error: insertErr } = await sb
    .from('wv_be_publishes')
    .insert({
      draft_id: d.id,
      draft_generated_at: d.generated_at,
      client_id: d.client_id,
      platform,
      platforms: [platform],
      publish_provider: 'ayrshare',
      status: isSuccess ? 'pending' : 'failed',  // pending = waiting for webhook to confirm; immediate-200 returns ayrsharePostId but we wait for per-platform confirmation
      ayrshare_post_id: ayrResult.ayrsharePostId,
      response_payload: ayrResult as unknown as Record<string, unknown>,
      published_at: isSuccess && (ayrResult.postIds?.length ?? 0) > 0 ? new Date().toISOString() : null,
      failure_reason: isSuccess ? null : ayrResult.errors?.map((e) => e.message).join('; ').slice(0, 500) ?? 'unknown',
      metadata: baseMetadata,
      platform_credential_id: cred.id,
      parent_publish_id: body.parent_publish_id ?? null,
      retry_count: retryCount,
    })
    .select('id, status')
    .single()

  if (insertErr || !pubRow) {
    return NextResponse.json({ error: 'publish_persist_failed', detail: insertErr?.message }, { status: 500 })
  }

  // Update draft
  if (isSuccess) {
    await sb
      .from('wv_be_drafts')
      .update({ published_at: new Date().toISOString(), last_publish_id: pubRow.id })
      .eq('id', d.id)
  }

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: d.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: isSuccess ? 'publish_initiated' : 'publish_failed',
    target_table: 'wv_be_publishes',
    target_id: pubRow.id,
    after_state: {
      status: pubRow.status,
      ayrshare_post_id: ayrResult.ayrsharePostId,
      retry_count: retryCount,
      platforms: [platform],
      cost_cents: ayrsharePostCostCents('premium', 1),  // TODO Slice 9: detect tier from settings
    },
  })

  return NextResponse.json({
    publish_id: pubRow.id,
    status: pubRow.status,
    ayrshare_post_id: ayrResult.ayrsharePostId,
    platforms_published: ayrResult.postIds ?? [],
    published_at: isSuccess ? new Date().toISOString() : null,
    retry_count: retryCount,
    cap_status: cap.status,
  })
}
