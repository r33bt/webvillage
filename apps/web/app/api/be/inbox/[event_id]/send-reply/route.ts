// apps/web/app/api/be/inbox/[event_id]/send-reply/route.ts
// Slice 7: send chosen reply via Vista API. Pre-send banned-phrase recheck + inline token refresh.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { encryptToken, decryptToken } from '@/lib/be-token-encryption'
import { sendMessage, refreshOAuthToken, VistaAPIError } from '@/lib/vista-client'
import { enforceBannedPhrases } from '@/lib/be-banned-phrase-enforcer'

export const runtime = 'nodejs'
export const maxDuration = 30

const RequestSchema = z.object({
  draft_id: z.string().uuid(),
  reply_body_final: z.string().min(1).max(10000),
  reply_to_external_id: z.string().min(1),
})

const CHAR_LIMIT = {
  comment: 1300,
  mention: 1300,
  dm: 3000,
  reaction: 280,
} as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = await params
  if (!z.string().uuid().safeParse(event_id).success) {
    return NextResponse.json({ error: 'invalid_event_id' }, { status: 400 })
  }

  let body: z.infer<typeof RequestSchema>
  try {
    body = RequestSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  // 1. Fetch event
  const { data: event } = await sb.from('wv_be_inbox_events').select('*').eq('id', event_id).maybeSingle()
  if (!event) return NextResponse.json({ error: 'event_not_found' }, { status: 404 })
  if (event.reply_sent_at) return NextResponse.json({ error: 'event_already_replied' }, { status: 409 })

  // 2. Char limit check
  const limit = CHAR_LIMIT[event.event_type as keyof typeof CHAR_LIMIT] ?? 1300
  if (body.reply_body_final.length > limit) {
    return NextResponse.json(
      { error: 'reply_too_long', length: body.reply_body_final.length, limit, event_type: event.event_type },
      { status: 413 }
    )
  }

  // 3. Pre-send banned-phrase recheck (founder may have edited bad phrases back in)
  const { data: bannedCanon } = await sb
    .from('wv_be_banned_phrases_canon')
    .select('phrase, category, severity, rationale')
    .eq('active', true)
  const enforcer = enforceBannedPhrases(body.reply_body_final, (bannedCanon ?? []) as { phrase: string; category: string | null; severity: 'block' | 'flag' }[])
  if (enforcer.hasHardFail) {
    return NextResponse.json(
      { error: 'banned_phrase_in_final', flags: { banned_in_final_edit: true, block_hits: enforcer.blockHits.map((h) => h.phrase) } },
      { status: 422 }
    )
  }

  // 4. Fetch + decrypt OAuth token
  const { data: cred } = await sb
    .from('wv_be_platform_credentials')
    .select('*')
    .eq('client_id', event.client_id)
    .eq('platform', 'vista_linkedin')
    .is('deleted_at', null)
    .maybeSingle()

  if (!cred) {
    return NextResponse.json({ error: 'vista_not_connected', detail: 'Connect Vista for this brand first' }, { status: 412 })
  }

  let accessToken: string
  try {
    accessToken = decryptToken(cred.oauth_access_token_encrypted as string)
  } catch (err) {
    return NextResponse.json(
      { error: 'token_decrypt_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  // 5. Inline token refresh if expiring within 5 min
  const expiresAt = cred.oauth_expires_at ? new Date(cred.oauth_expires_at as string).getTime() : Infinity
  if (expiresAt < Date.now() + 5 * 60 * 1000 && cred.oauth_refresh_token_encrypted) {
    try {
      const refreshToken = decryptToken(cred.oauth_refresh_token_encrypted as string)
      const refreshed = await refreshOAuthToken(refreshToken)
      accessToken = refreshed.access_token
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
      await sb
        .from('wv_be_platform_credentials')
        .update({
          oauth_access_token_encrypted: encryptToken(refreshed.access_token),
          oauth_refresh_token_encrypted: refreshed.refresh_token ? encryptToken(refreshed.refresh_token) : cred.oauth_refresh_token_encrypted,
          oauth_expires_at: newExpiresAt,
          last_refreshed_at: new Date().toISOString(),
        })
        .eq('id', cred.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await sb.from('wv_be_audit_log').insert({
        client_id: event.client_id,
        actor_user_id: null,
        actor_type: 'system',
        action: 'vista_oauth_refresh_failed',
        target_table: 'wv_be_platform_credentials',
        target_id: cred.id,
        after_state: { detail: msg.slice(0, 300) },
      })
      return NextResponse.json({ error: 'token_refresh_failed', detail: msg }, { status: 422 })
    }
  }

  // 6. Send via Vista
  const messageType = event.event_type === 'dm' ? 'direct_message' : 'comment'
  let sendResult
  try {
    sendResult = await sendMessage({
      workspaceId: cred.external_workspace_id as string,
      replyToExternalId: body.reply_to_external_id,
      platform: 'linkedin',
      messageType,
      body: body.reply_body_final,
      accessToken,
    })
  } catch (err) {
    if (err instanceof VistaAPIError) {
      // 401 = token invalid; 404 = source deleted; 429 = rate limit; 5xx = transient
      if (err.status === 429) {
        return NextResponse.json({ error: 'vista_rate_limited', retry_after_sec: err.retryAfterSec ?? 60 }, { status: 503 })
      }
      if (err.status === 401) {
        return NextResponse.json({ error: 'vista_token_invalid', detail: 'Reconnect Vista for this brand' }, { status: 422 })
      }
      if (err.status === 404) {
        // Source post deleted — auto-dismiss
        await sb
          .from('wv_be_inbox_events')
          .update({ dismissed_at: new Date().toISOString(), dismiss_reason: 'source_deleted', send_failure_reason: 'vista_404_source_deleted' })
          .eq('id', event_id)
        return NextResponse.json({ error: 'source_post_deleted', auto_dismissed: true }, { status: 422 })
      }
      if (err.status >= 500) {
        return NextResponse.json({ error: 'vista_unavailable', detail: err.detail }, { status: 502 })
      }
      return NextResponse.json({ error: 'vista_error', status: err.status, detail: err.detail }, { status: 422 })
    }
    return NextResponse.json(
      { error: 'send_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  // 7. Persist reply state
  const sentAt = new Date().toISOString()
  await sb
    .from('wv_be_inbox_events')
    .update({
      reply_draft_id: body.draft_id,
      reply_body_final: body.reply_body_final,
      reply_sent_at: sentAt,
      vista_reply_id: sendResult.vistaReplyId,
      send_failure_reason: null,
    })
    .eq('id', event_id)

  // 8. Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: event.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'inbox_reply_sent',
    target_table: 'wv_be_inbox_events',
    target_id: event_id,
    before_state: { reply_draft_id_chosen: body.draft_id, reply_body_final_length: body.reply_body_final.length },
    after_state: { vista_reply_id: sendResult.vistaReplyId, external_url: sendResult.externalUrl, char_count: body.reply_body_final.length },
  })

  return NextResponse.json({
    inbox_event_id: event_id,
    reply_sent_at: sentAt,
    vista_reply_id: sendResult.vistaReplyId,
    external_url: sendResult.externalUrl,
  })
}
