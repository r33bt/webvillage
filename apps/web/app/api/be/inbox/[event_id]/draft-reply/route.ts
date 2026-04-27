// apps/web/app/api/be/inbox/[event_id]/draft-reply/route.ts
// Slice 7: generates 1-3 reply variants by calling Slice 3 /api/be/drafts in parallel.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { detectSentiment } from '@/lib/inbox-sentiment'
import { headers } from 'next/headers'

export const runtime = 'nodejs'
export const maxDuration = 60

const RequestSchema = z.object({
  variant_count: z.number().int().min(1).max(5).default(3),
  override_template_id: z.string().uuid().optional(),
  founder_hint: z.string().max(500).optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = await params
  if (!z.string().uuid().safeParse(event_id).success) {
    return NextResponse.json({ error: 'invalid_event_id' }, { status: 400 })
  }

  let body: z.infer<typeof RequestSchema>
  try {
    body = RequestSchema.parse((await req.json().catch(() => ({}))) ?? {})
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  // Fetch the inbox event
  const { data: event } = await sb
    .from('wv_be_inbox_events')
    .select('*')
    .eq('id', event_id)
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ error: 'event_not_found' }, { status: 404 })
  }
  if (event.reply_sent_at) {
    return NextResponse.json({ error: 'event_already_replied' }, { status: 409 })
  }

  // Resolve template_id: override OR canon LinkedIn reply
  let templateId = body.override_template_id
  if (!templateId) {
    const { data: canonReply } = await sb
      .from('wv_be_templates')
      .select('id')
      .eq('template_type', 'reply')
      .eq('is_default', true)
      .eq('platform', 'linkedin')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()
    if (!canonReply) {
      return NextResponse.json({ error: 'no_reply_template_available' }, { status: 412 })
    }
    templateId = canonReply.id as string
  }

  // Build vars
  const sentimentHint = detectSentiment((event.source_excerpt as string | null) ?? '')
  const sharedVars = {
    event_type: event.event_type as string,
    source_handle: (event.source_handle as string | null) ?? '',
    source_display_name: (event.source_display_name as string | null) ?? '',
    inbound_message: (event.source_excerpt as string | null) ?? '',
    sentiment_hint: sentimentHint,
    founder_hint: body.founder_hint ?? '',
  }

  // Determine base URL
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const baseUrl = `${proto}://${host}`

  // Fire N variant calls in parallel
  const t0 = Date.now()
  const promises = Array.from({ length: body.variant_count }).map(async () => {
    const resp = await fetch(`${baseUrl}/api/be/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: event.client_id,
        template_id: templateId,
        prompt: `Reply to LinkedIn ${event.event_type} from ${event.source_handle ?? 'unknown'}`,
        source_type: 'reply',
        inbox_event_id: event_id,
        vars: sharedVars,
      }),
    })
    return resp
  })

  const responses = await Promise.all(promises)
  const totalLatencyMs = Date.now() - t0

  const variants: Array<{
    draft_id: string
    draft_body: string
    scores: Record<string, number>
    passes_threshold: boolean
    banned_phrase_hits: string[]
    flags: Record<string, unknown>
    cost_cents: number
  }> = []
  let totalCostCents = 0

  for (const resp of responses) {
    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '')
      console.warn('[draft-reply] variant failed:', resp.status, errBody.slice(0, 200))
      continue
    }
    const j = await resp.json()
    const cost = (j.generation?.cost_cents ?? 0) + (j.scoring?.cost_cents ?? 0)
    variants.push({
      draft_id: j.draft_id,
      draft_body: j.draft_body,
      scores: j.scores,
      passes_threshold: j.passes_threshold,
      banned_phrase_hits: j.banned_phrase_hits ?? [],
      flags: j.flags ?? {},
      cost_cents: cost,
    })
    totalCostCents += cost
  }

  if (variants.length === 0) {
    return NextResponse.json(
      { error: 'all_variants_failed', detail: 'See server logs; common cause: Anthropic credit balance' },
      { status: 422 }
    )
  }

  // Audit log: batch summary (per-variant audits already written by Slice 3)
  await sb.from('wv_be_audit_log').insert({
    client_id: event.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'inbox_reply_variants_generated',
    target_table: 'wv_be_inbox_events',
    target_id: event_id,
    after_state: {
      variant_count: variants.length,
      draft_ids: variants.map((v) => v.draft_id),
      total_cost_cents: totalCostCents,
      total_latency_ms: totalLatencyMs,
    },
  })

  // Update inbox_event with reply_draft_generated_at (latest draft generation time)
  await sb
    .from('wv_be_inbox_events')
    .update({ reply_draft_generated_at: new Date().toISOString() })
    .eq('id', event_id)

  return NextResponse.json({
    inbox_event_id: event_id,
    variants,
    generation_total_cost_cents: totalCostCents,
    generation_total_latency_ms: totalLatencyMs,
  })
}
