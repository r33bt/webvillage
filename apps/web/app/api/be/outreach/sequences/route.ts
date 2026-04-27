// apps/web/app/api/be/outreach/sequences/route.ts
// Slice 10: POST creates sequence; GET lists sequences for a client.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const CreateSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  channel: z.literal('email').default('email'),
  cadence_days: z.array(z.number().int().min(0)).min(1).max(7),
  template_ids: z.array(z.string().uuid()).min(1).max(7),
  reply_to_email_override: z.string().email().optional(),
  per_domain_daily_cap: z.number().int().min(1).max(500).default(50),
})

export async function POST(req: NextRequest) {
  let body: z.infer<typeof CreateSchema>
  try {
    body = CreateSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (body.cadence_days.length !== body.template_ids.length) {
    return NextResponse.json(
      { error: 'cadence_template_mismatch', detail: `cadence_days.length (${body.cadence_days.length}) must equal template_ids.length (${body.template_ids.length})` },
      { status: 400 }
    )
  }
  // cadence_days strictly increasing starting at 0
  for (let i = 0; i < body.cadence_days.length; i++) {
    if (i === 0 && body.cadence_days[0] !== 0) {
      return NextResponse.json({ error: 'cadence_must_start_at_zero' }, { status: 400 })
    }
    if (i > 0 && body.cadence_days[i]! <= body.cadence_days[i - 1]!) {
      return NextResponse.json({ error: 'cadence_must_be_increasing' }, { status: 400 })
    }
  }

  const sb = createSupabaseServiceClient()

  // Verify client + templates exist
  const { data: client } = await sb.from('wv_be_clients').select('id, reply_to_email').eq('id', body.client_id).is('deleted_at', null).single()
  if (!client) return NextResponse.json({ error: 'client_not_found' }, { status: 404 })

  const { data: tpls } = await sb
    .from('wv_be_templates')
    .select('id, name, template_type, client_id, is_default')
    .in('id', body.template_ids)
    .is('deleted_at', null)
  if (!tpls || tpls.length !== body.template_ids.length) {
    return NextResponse.json({ error: 'template_not_found_or_inaccessible' }, { status: 404 })
  }
  for (const t of tpls) {
    if (!t.is_default && t.client_id !== body.client_id) {
      return NextResponse.json({ error: 'template_not_visible_to_client', template_id: t.id }, { status: 403 })
    }
  }

  const replyTo = body.reply_to_email_override ?? client.reply_to_email ?? 'hello@webvillage.com'

  const { data: seq, error: seqErr } = await sb
    .from('wv_be_outreach_sequences')
    .insert({
      client_id: body.client_id,
      name: body.name,
      channel: body.channel,
      cadence_days: body.cadence_days,
      template_ids: body.template_ids,
      status: 'draft',
    })
    .select('*')
    .single()
  if (seqErr || !seq) {
    return NextResponse.json({ error: 'sequence_persist_failed', detail: seqErr?.message }, { status: 500 })
  }

  // Update sequence with reply_to + cap (separate update because columns may not be in original insert path)
  await sb.from('wv_be_outreach_sequences').update({
    reply_to_email_override: body.reply_to_email_override ?? null,
    per_domain_daily_cap: body.per_domain_daily_cap,
  }).eq('id', seq.id)

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: body.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'sequence_created',
    target_table: 'wv_be_outreach_sequences',
    target_id: seq.id,
    after_state: { name: body.name, cadence_days: body.cadence_days, template_count: body.template_ids.length },
  })

  const tplById = new Map((tpls ?? []).map((t) => [t.id, t]))
  return NextResponse.json(
    {
      sequence_id: seq.id,
      sequence: { ...seq, reply_to_email: replyTo, per_domain_daily_cap: body.per_domain_daily_cap, reply_to_email_override: body.reply_to_email_override ?? null },
      touches: body.template_ids.map((tid, i) => ({
        touch_index: i + 1,
        day_offset: body.cadence_days[i],
        template_id: tid,
        template_name: tplById.get(tid)?.name ?? '?',
      })),
    },
    { status: 201 }
  )
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const clientId = url.searchParams.get('client_id')
  const status = url.searchParams.get('status')
  const limit = Math.min(200, parseInt(url.searchParams.get('limit') ?? '50', 10) || 50)

  if (!clientId || !z.string().uuid().safeParse(clientId).success) {
    return NextResponse.json({ error: 'invalid_client_id' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()
  let q = sb
    .from('wv_be_outreach_sequences')
    .select('*')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (status) q = q.eq('status', status)

  const { data: sequences } = await q

  // Count recipients per sequence (for list view)
  const seqIds = (sequences ?? []).map((s) => s.id as string)
  const recipientCounts = new Map<string, { total: number; replied: number; bounced: number; opted_out: number }>()
  if (seqIds.length > 0) {
    const { data: recipients } = await sb
      .from('wv_be_outreach_recipients')
      .select('sequence_id, status')
      .in('sequence_id', seqIds)
      .is('deleted_at', null)
    for (const r of recipients ?? []) {
      const seqId = r.sequence_id as string
      if (!recipientCounts.has(seqId)) recipientCounts.set(seqId, { total: 0, replied: 0, bounced: 0, opted_out: 0 })
      const c = recipientCounts.get(seqId)!
      c.total++
      if (r.status === 'replied') c.replied++
      else if (r.status === 'bounced' || r.status === 'spam') c.bounced++
      else if (r.status === 'opted_out') c.opted_out++
    }
  }

  return NextResponse.json({
    sequences: (sequences ?? []).map((s) => ({
      ...s,
      recipient_count: recipientCounts.get(s.id as string)?.total ?? 0,
      reply_count: recipientCounts.get(s.id as string)?.replied ?? 0,
      bounce_count: recipientCounts.get(s.id as string)?.bounced ?? 0,
      opted_out_count: recipientCounts.get(s.id as string)?.opted_out ?? 0,
    })),
  })
}
