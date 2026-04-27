// apps/web/app/api/be/jobs/tick/route.ts
// Brand Engine Slice 6 interim worker. Vercel cron fires every minute.
// Processes ONE slot per tick (Vercel function timeout safety; spec §9 correction).
// Slice 12 graphile-worker on Railway will replace this without changing public API.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { buildClusterContextVars } from '@/lib/be-cluster-context'
import { headers } from 'next/headers'

export const runtime = 'nodejs'
export const maxDuration = 60

interface JobRow {
  id: string
  client_id: string
  job_type: string
  payload: { cluster_id: string; start_from_slot_index?: number; total_slots_to_process?: number; force?: boolean }
  status: string
  progress: { current_slot: number | null; total_slots: number } | null
  attempt_count: number
}

interface SlotRow {
  id: string
  cluster_id: string
  slot_index: number
  slot_topic: string
  slot_brief: string
  slot_arc_role: string | null
  status: string
  template_id: string | null
}

interface ClusterRow {
  id: string
  client_id: string
  name: string
  theme: string
  target_audience: string
  arc_type: string | null
  cluster_template_id: string | null
  total_slots: number
  status: string
}

async function pickAndLockJob(): Promise<JobRow | null> {
  const sb = createSupabaseServiceClient()
  // Pick oldest pending or processing job across all known types
  // Slice 6: cluster_generate; Slice 8: publish
  const { data: candidates } = await sb
    .from('wv_be_jobs')
    .select('id, client_id, job_type, payload, status, progress, attempt_count')
    .in('status', ['pending', 'processing'])
    .in('job_type', ['cluster_generate', 'publish'])
    .order('created_at', { ascending: true })
    .limit(1)

  if (!candidates || candidates.length === 0) return null
  const job = candidates[0] as JobRow

  // Lock — best-effort; concurrent ticks could race on the SAME row but Vercel cron is single-instance per cron entry
  const { error: lockErr } = await sb
    .from('wv_be_jobs')
    .update({
      status: 'processing',
      locked_at: new Date().toISOString(),
      locked_by: process.env.VERCEL_DEPLOYMENT_ID ?? 'local',
      started_at: job.attempt_count === 0 ? new Date().toISOString() : undefined,
      attempt_count: job.attempt_count + 1,
    })
    .eq('id', job.id)
  if (lockErr) {
    console.error('[jobs/tick] lock failed:', lockErr)
    return null
  }
  return job
}

async function processClusterSlot(job: JobRow): Promise<{ done: boolean; error?: string }> {
  const sb = createSupabaseServiceClient()
  const { cluster_id } = job.payload
  const startFrom = job.payload.start_from_slot_index ?? 1

  // Re-fetch cluster + verify still alive
  const { data: clusterData } = await sb
    .from('wv_be_clusters')
    .select('id, client_id, name, theme, target_audience, arc_type, cluster_template_id, total_slots, status')
    .eq('id', cluster_id)
    .is('deleted_at', null)
    .maybeSingle()
  if (!clusterData) {
    return { done: true, error: 'cluster_deleted_during_generation' }
  }
  const cluster = clusterData as ClusterRow

  // Fetch all slots
  const { data: allSlotsData } = await sb
    .from('wv_be_cluster_slots')
    .select('id, cluster_id, slot_index, slot_topic, slot_brief, slot_arc_role, status, template_id')
    .eq('cluster_id', cluster_id)
    .order('slot_index', { ascending: true })
  const allSlots = (allSlotsData ?? []) as SlotRow[]

  // Find next slot to process: status='planned' AND slot_index >= startFrom, lowest slot_index
  const nextSlot = allSlots.find((s) => (s.slot_index as number) >= startFrom && s.status === 'planned')

  if (!nextSlot) {
    // All slots done (or all subsequent slots are non-planned). Mark cluster completed.
    await sb
      .from('wv_be_clusters')
      .update({ status: 'completed', generation_completed_at: new Date().toISOString() })
      .eq('id', cluster_id)

    await sb.from('wv_be_audit_log').insert({
      client_id: cluster.client_id,
      actor_user_id: null,
      actor_type: 'system',
      action: 'cluster_generation_completed',
      target_table: 'wv_be_clusters',
      target_id: cluster_id,
      after_state: {
        slots_drafted: allSlots.filter((s) => s.status === 'drafted').length,
        slots_failed: allSlots.filter((s) => s.status === 'failed').length,
      },
    })
    return { done: true }
  }

  // Mark this slot as 'generating'
  await sb
    .from('wv_be_cluster_slots')
    .update({ status: 'generating' })
    .eq('id', nextSlot.id)

  // Update job progress
  await sb
    .from('wv_be_jobs')
    .update({ progress: { current_slot: nextSlot.slot_index, total_slots: cluster.total_slots } })
    .eq('id', job.id)

  // Build cluster context vars
  const contextVars = buildClusterContextVars(
    {
      id: cluster.id,
      name: cluster.name,
      theme: cluster.theme,
      target_audience: cluster.target_audience,
      arc_type: cluster.arc_type,
      total_slots: cluster.total_slots,
    },
    {
      slot_index: nextSlot.slot_index,
      slot_topic: nextSlot.slot_topic,
      slot_brief: nextSlot.slot_brief,
      slot_arc_role: nextSlot.slot_arc_role,
    },
    allSlots.map((s) => ({
      slot_index: s.slot_index,
      slot_topic: s.slot_topic,
      slot_brief: s.slot_brief,
      slot_arc_role: s.slot_arc_role,
    }))
  )

  // Resolve template_id (per-slot override else cluster default)
  const templateId = nextSlot.template_id ?? cluster.cluster_template_id
  if (!templateId) {
    await sb
      .from('wv_be_cluster_slots')
      .update({ status: 'failed', last_error: 'no_template_id (slot has no override and cluster has no default)' })
      .eq('id', nextSlot.id)
    await sb
      .from('wv_be_clusters')
      .update({ status: 'paused' })
      .eq('id', cluster_id)
    return { done: false, error: `slot ${nextSlot.slot_index} missing template_id` }
  }

  // Determine base URL for internal HTTP
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const baseUrl = `${proto}://${host}`

  // Call /api/be/drafts (Slice 3)
  let draftsResp: Response
  try {
    draftsResp = await fetch(`${baseUrl}/api/be/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: cluster.client_id,
        template_id: templateId,
        prompt: nextSlot.slot_brief,
        cluster_id: cluster.id,
        cluster_slot: nextSlot.slot_index,
        vars: contextVars,
      }),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await sb.from('wv_be_cluster_slots').update({ status: 'planned', last_error: `network_error: ${msg}` }).eq('id', nextSlot.id)
    await sb.from('wv_be_clusters').update({ status: 'paused' }).eq('id', cluster_id)
    await sb.from('wv_be_audit_log').insert({
      client_id: cluster.client_id,
      actor_user_id: null,
      actor_type: 'system',
      action: 'cluster_generation_paused',
      target_table: 'wv_be_clusters',
      target_id: cluster_id,
      after_state: { failed_at_slot_index: nextSlot.slot_index, last_error: msg },
    })
    return { done: false, error: msg }
  }

  if (draftsResp.status === 200) {
    const draftJson = await draftsResp.json()
    await sb
      .from('wv_be_cluster_slots')
      .update({
        status: 'drafted',
        draft_id: draftJson.draft_id,
        draft_generated_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', nextSlot.id)
    return { done: false }  // more slots may remain
  }

  // Failure path — read body for surfacing
  const errBody = await draftsResp.text()
  const errSummary = errBody.slice(0, 500)

  if (draftsResp.status === 422) {
    // Slice 3 hard fail after retry — pause cluster
    await sb.from('wv_be_cluster_slots').update({ status: 'failed', last_error: errSummary }).eq('id', nextSlot.id)
    await sb.from('wv_be_clusters').update({ status: 'paused' }).eq('id', cluster_id)
    await sb.from('wv_be_audit_log').insert({
      client_id: cluster.client_id,
      actor_user_id: null,
      actor_type: 'system',
      action: 'cluster_generation_paused',
      target_table: 'wv_be_clusters',
      target_id: cluster_id,
      after_state: { failed_at_slot_index: nextSlot.slot_index, last_error: errSummary, http_status: 422 },
    })
    return { done: true, error: `slot ${nextSlot.slot_index} hard-failed (Slice 3 422): ${errSummary}` }
  }

  // 5xx or other — revert slot to planned (so resume can retry it), pause cluster
  await sb.from('wv_be_cluster_slots').update({ status: 'planned', last_error: errSummary }).eq('id', nextSlot.id)
  await sb.from('wv_be_clusters').update({ status: 'paused' }).eq('id', cluster_id)
  await sb.from('wv_be_audit_log').insert({
    client_id: cluster.client_id,
    actor_user_id: null,
    actor_type: 'system',
    action: 'cluster_generation_paused',
    target_table: 'wv_be_clusters',
    target_id: cluster_id,
    after_state: { failed_at_slot_index: nextSlot.slot_index, last_error: errSummary, http_status: draftsResp.status },
  })
  return { done: false, error: `slot ${nextSlot.slot_index} failed (HTTP ${draftsResp.status}): ${errSummary}` }
}

export async function POST(_req: NextRequest) {
  // Cron auth check
  const h = await headers()
  const auth = h.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  // Vercel cron sends `Authorization: Bearer <CRON_SECRET>` automatically when CRON_SECRET is set in env
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createSupabaseServiceClient()

  const job = await pickAndLockJob()
  if (!job) {
    return NextResponse.json({ processed: 0, message: 'no pending jobs' })
  }

  let outcome: { done: boolean; error?: string }
  try {
    if (job.job_type === 'cluster_generate') {
      outcome = await processClusterSlot(job)
    } else if (job.job_type === 'publish') {
      outcome = await processPublishJob(job)
    } else {
      outcome = { done: true, error: `unknown_job_type: ${job.job_type}` }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await sb.from('wv_be_jobs').update({ status: 'failed', last_error: `worker_exception: ${msg}`, completed_at: new Date().toISOString() }).eq('id', job.id)
    return NextResponse.json({ error: 'worker_exception', detail: msg }, { status: 500 })
  }

  if (outcome.done) {
    await sb
      .from('wv_be_jobs')
      .update({ status: outcome.error ? 'failed' : 'completed', last_error: outcome.error ?? null, completed_at: new Date().toISOString() })
      .eq('id', job.id)
  } else if (outcome.error) {
    await sb
      .from('wv_be_jobs')
      .update({ status: 'failed', last_error: outcome.error, completed_at: new Date().toISOString() })
      .eq('id', job.id)
  } else {
    // Slot succeeded; more slots remain — leave job as 'processing' for next tick
  }

  return NextResponse.json({
    processed: 1,
    job_id: job.id,
    job_type: job.job_type,
    done: outcome.done,
    error: outcome.error ?? null,
  })
}

// ----------------------------------------------------------------------------
// Slice 8: publish job processor
// ----------------------------------------------------------------------------

async function processPublishJob(job: JobRow): Promise<{ done: boolean; error?: string }> {
  const sb = createSupabaseServiceClient()
  const { publish_id, scheduled_for } = job.payload as { publish_id?: string; scheduled_for?: string }

  if (!publish_id) {
    return { done: true, error: 'missing_publish_id_in_payload' }
  }

  // Defer if scheduled_for is in the future (job claimed too early — leave it)
  if (scheduled_for && new Date(scheduled_for).getTime() > Date.now()) {
    // Re-queue: revert status and clear lock
    await sb.from('wv_be_jobs').update({ status: 'pending', locked_at: null, locked_by: null }).eq('id', job.id)
    return { done: false }  // not really done — but signals "no more work this tick"; will be re-picked next tick
  }

  // Fetch publish row + verify still queued (cancellation race)
  const { data: pub } = await sb
    .from('wv_be_publishes')
    .select('id, client_id, draft_id, draft_generated_at, platforms, metadata, platform_credential_id, status, parent_publish_id')
    .eq('id', publish_id)
    .maybeSingle()
  if (!pub) {
    return { done: true, error: 'publish_not_found' }
  }
  if (pub.status !== 'queued') {
    // Cancelled / already processed — skip
    return { done: true, error: pub.status === 'cancelled' ? 'cancelled_by_founder' : `unexpected_state: ${pub.status}` }
  }

  // Verify draft not soft-deleted
  const { data: draft } = await sb
    .from('wv_be_drafts')
    .select('id, draft_body, generated_at, scheduled_for')
    .eq('id', pub.draft_id)
    .maybeSingle()
  if (!draft) {
    await sb.from('wv_be_publishes').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), failure_reason: 'draft_deleted' }).eq('id', publish_id)
    return { done: true, error: 'draft_deleted_during_schedule' }
  }

  // Fetch platform credential
  const { data: cred } = await sb
    .from('wv_be_platform_credentials')
    .select('oauth_access_token_encrypted, external_workspace_id')
    .eq('id', pub.platform_credential_id as string)
    .maybeSingle()
  if (!cred) {
    await sb.from('wv_be_publishes').update({ status: 'failed', failure_reason: 'credential_missing_at_fire_time' }).eq('id', publish_id)
    return { done: true, error: 'credential_missing' }
  }

  // Decrypt + fire Ayrshare
  const { decryptToken } = await import('@/lib/be-token-encryption')
  const { ayrsharePostWithRetry, AyrshareAPIError } = await import('@/lib/ayrshare')

  const profileKey = decryptToken(cred.oauth_access_token_encrypted as string)
  const overrideBody = (job.payload as { override_body?: string }).override_body
  const finalBody = overrideBody ?? draft.draft_body

  // Mark publish row as 'pending' (Ayrshare call in progress)
  await sb.from('wv_be_publishes').update({ status: 'pending' }).eq('id', publish_id)

  let ayrResult, retryCount = 0
  try {
    const r = await ayrsharePostWithRetry({
      profileKey,
      body: finalBody as string,
      platforms: pub.platforms as string[],
    })
    ayrResult = r.result
    retryCount = r.retryCount
  } catch (err) {
    if (err instanceof AyrshareAPIError) {
      await sb
        .from('wv_be_publishes')
        .update({ status: 'failed', failure_reason: `${err.status}: ${err.detail.slice(0, 200)}`, retry_count: retryCount, response_payload: { ayrshare_error: { status: err.status, detail: err.detail } } })
        .eq('id', publish_id)
      await sb.from('wv_be_audit_log').insert({
        client_id: pub.client_id,
        actor_user_id: null,
        actor_type: 'system',
        action: 'publish_failed',
        target_table: 'wv_be_publishes',
        target_id: publish_id,
        after_state: { status: 'failed', failure_reason: err.detail.slice(0, 200), retry_count: retryCount, source: 'cron_tick' },
      })
      return { done: true, error: `ayrshare_failed: ${err.status}` }
    }
    throw err
  }

  const isSuccess = ayrResult.status === 'success'
  await sb
    .from('wv_be_publishes')
    .update({
      status: isSuccess ? 'pending' : 'failed',  // pending = waiting for confirmation webhook
      ayrshare_post_id: ayrResult.ayrsharePostId,
      response_payload: ayrResult as unknown as Record<string, unknown>,
      published_at: isSuccess && (ayrResult.postIds?.length ?? 0) > 0 ? new Date().toISOString() : null,
      failure_reason: isSuccess ? null : (ayrResult.errors?.map((e) => e.message).join('; ').slice(0, 500) ?? 'unknown'),
      retry_count: retryCount,
    })
    .eq('id', publish_id)

  if (isSuccess) {
    await sb
      .from('wv_be_drafts')
      .update({ published_at: new Date().toISOString(), scheduled_for: null, last_publish_id: publish_id })
      .eq('id', draft.id)
  }

  await sb.from('wv_be_audit_log').insert({
    client_id: pub.client_id,
    actor_user_id: null,
    actor_type: 'system',
    action: isSuccess ? 'publish_initiated' : 'publish_failed',
    target_table: 'wv_be_publishes',
    target_id: publish_id,
    after_state: { status: isSuccess ? 'pending' : 'failed', ayrshare_post_id: ayrResult.ayrsharePostId, retry_count: retryCount, source: 'cron_tick' },
  })

  return { done: true }
}

// Allow GET for Vercel cron dashboard testing
export async function GET(req: NextRequest) {
  return POST(req)
}
