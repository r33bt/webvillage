/**
 * POST /api/be/strategy/generate
 *
 * Slice 6.5 — self-serve strategy layer.
 *
 * Flow:
 *  1. Auth check (BH_INTERNAL_TOKEN)
 *  2. Load tenant (wv_be_clients.metadata for brand_facts)
 *  3. Load voice profile (wv_be_voice_profiles)
 *  4. Call Claude with tool use → 3-5 pillars + ≥12 topic stubs
 *  5. Persist pillars+topics to wv_be_clients.metadata.content_pillars
 *  6. Get or create current-month wv_be_calendars row for client
 *  7. Seed wv_be_calendar_slots at status='briefed' from topic stubs
 *  8. Return { pillars, topics, slots_seeded, calendar_id }
 *
 * Auth: BH_INTERNAL_TOKEN header (x-bh-internal). Fail-open in dev.
 */

import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { getServiceRoleClient, type VoiceProfileRow, type ClientMetadata } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContentPillar = {
  id: string
  name: string
  description: string
  channels: string[]
  monthly_posts: number
}

export type TopicStub = {
  pillar_id: string
  title: string
  channel: string
  piece_type: string
  scheduled_week: number // 1-4
}

export type ContentPillarsMetadata = {
  generated_at: string
  target_month: string // 'YYYY-MM'
  pillars: ContentPillar[]
  topics: TopicStub[]
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  client_id: z.string().uuid({ message: 'client_id must be a valid UUID' }),
  target_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'target_month must be YYYY-MM format')
    .optional(),
})

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.BH_INTERNAL_TOKEN
  if (!token) return true
  return req.headers.get('x-bh-internal') === token
}

// ---------------------------------------------------------------------------
// Claude tool schema
// ---------------------------------------------------------------------------

const STRATEGY_TOOL: Anthropic.Tool = {
  name: 'save_content_strategy',
  description: 'Save the generated content strategy with pillars and monthly topic stubs.',
  input_schema: {
    type: 'object' as const,
    properties: {
      pillars: {
        type: 'array',
        description: '3-5 content pillars that define this brand\'s owned themes',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'slug-format identifier e.g. "thought-leadership"' },
            name: { type: 'string', description: 'Pillar display name (2-4 words)' },
            description: { type: 'string', description: '1-2 sentence description of what this pillar owns' },
            channels: {
              type: 'array',
              items: { type: 'string', enum: ['linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'email', 'blog'] },
              description: 'Best-fit channels for this pillar',
            },
            monthly_posts: { type: 'number', description: 'Recommended posts per month for this pillar' },
          },
          required: ['id', 'name', 'description', 'channels', 'monthly_posts'],
        },
        minItems: 3,
        maxItems: 5,
      },
      topics: {
        type: 'array',
        description: '12-15 actionable topic stubs for the target month, spread across pillars',
        items: {
          type: 'object',
          properties: {
            pillar_id: { type: 'string', description: 'Must match one of the pillar ids above' },
            title: { type: 'string', description: 'The content hook/angle — 1 punchy sentence, specific enough to write from immediately' },
            channel: { type: 'string', enum: ['linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'email', 'blog'] },
            piece_type: { type: 'string', enum: ['post', 'long_form_article', 'newsletter'] },
            scheduled_week: { type: 'number', enum: [1, 2, 3, 4], description: 'Which week of the month' },
          },
          required: ['pillar_id', 'title', 'channel', 'piece_type', 'scheduled_week'],
        },
        minItems: 12,
        maxItems: 15,
      },
    },
    required: ['pillars', 'topics'],
  },
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildSystemPrompt(displayName: string, vp: VoiceProfileRow | null, brandFacts: ClientMetadata['brand_facts']): string {
  const parts = [
    `You are a content strategist for ${displayName}. Your job is to define the brand's owned content themes and generate specific, actionable topic stubs.`,
    '',
    '## Voice profile',
  ]

  if (vp?.audience) parts.push(`- Audience: ${vp.audience}`)
  if (vp?.one_word_tone) parts.push(`- Tone: ${vp.one_word_tone}${vp.register ? ` (${vp.register})` : ''}`)
  if (vp?.do_list?.length) parts.push(`- Always do: ${vp.do_list.join('; ')}`)
  if (vp?.dont_list?.length) parts.push(`- Never do: ${vp.dont_list.join('; ')}`)

  if (brandFacts) {
    parts.push('', '## Brand facts')
    if (brandFacts.mission) parts.push(`- Mission: ${brandFacts.mission}`)
    if (brandFacts.primary_outputs?.length) parts.push(`- Products/outputs: ${brandFacts.primary_outputs.join(', ')}`)
    if (brandFacts.industries?.length) parts.push(`- Industries: ${brandFacts.industries.join(', ')}`)
    if (brandFacts.key_claims?.length) {
      parts.push('- Key claims:')
      brandFacts.key_claims.slice(0, 5).forEach((c) => parts.push(`  • ${c}`))
    }
    if (brandFacts.geographies?.length) parts.push(`- Geographies: ${brandFacts.geographies.join(', ')}`)
  }

  parts.push(
    '',
    '## Instructions',
    '- Pillars should be themes this brand can CONSISTENTLY own — not one-off ideas.',
    '- Topics must be specific enough to write from immediately. No generic angles.',
    '- Spread topics across channels and weeks for a balanced calendar.',
    '- Avoid AI slop phrases ("delve into", "landscape", "synergy", "transformative").',
  )

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// Scheduling helpers
// ---------------------------------------------------------------------------

// Spread N topics evenly across a month. Returns day-of-month (1-indexed).
const SCHEDULE_DAYS = [2, 4, 7, 9, 12, 14, 16, 19, 21, 23, 26, 28, 5, 11, 17]

// Preferred hours by channel (local time, adjust via tz if needed)
const CHANNEL_HOUR: Record<string, number> = {
  linkedin:  9,
  blog:      10,
  instagram: 11,
  newsletter: 9,
  x:         8,
  tiktok:    12,
  facebook:  10,
  email:     9,
}

function buildScheduledFor(year: number, month: number, topic: TopicStub, topicIndex: number): string {
  const day = SCHEDULE_DAYS[topicIndex % SCHEDULE_DAYS.length] ?? (topicIndex + 1)
  // Clamp to last day of month
  const lastDay = new Date(year, month, 0).getDate()
  const clampedDay = Math.min(day, lastDay)
  const hour = CHANNEL_HOUR[topic.channel] ?? 9
  // Use +08:00 offset (consistent with existing seed data)
  return `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00+08:00`
}

// ---------------------------------------------------------------------------
// Calendar helpers
// ---------------------------------------------------------------------------

async function getOrCreateCalendar(
  sb: ReturnType<typeof getServiceRoleClient>,
  clientId: string,
  year: number,
  month: number,
  totalSlots: number,
): Promise<string> {
  const windowStart = `${year}-${String(month).padStart(2, '0')}-01`

  // Try to fetch existing
  const { data: existing } = await sb
    .from('wv_be_calendars')
    .select('id')
    .eq('client_id', clientId)
    .eq('window_type', 'month')
    .eq('window_start', windowStart)
    .maybeSingle()

  if (existing) return existing.id

  // Create new
  const lastDay = new Date(year, month, 0).getDate()
  const windowEnd = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data: created, error } = await sb
    .from('wv_be_calendars')
    .insert({
      client_id: clientId,
      window_type: 'month',
      window_start: windowStart,
      window_end: windowEnd,
      total_slots: totalSlots,
      source_strategy: 'monthly_batch_v1',
      status: 'approved',
      notes_md: `Auto-generated by Slice 6.5 pillar generator on ${new Date().toISOString().slice(0, 10)}.`,
    })
    .select('id')
    .single()

  if (error || !created) throw new Error(`Failed to create calendar: ${error?.message}`)
  return created.id
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  const { client_id } = parsed.data

  // Determine target month
  const now = new Date()
  const [targetYear, targetMonth] = parsed.data.target_month
    ? [parseInt(parsed.data.target_month.slice(0, 4)), parseInt(parsed.data.target_month.slice(5, 7))]
    : [now.getFullYear(), now.getMonth() + 1]

  const sb = getServiceRoleClient()

  // Load tenant
  const { data: client, error: clientErr } = await sb
    .from('wv_be_clients')
    .select('id, display_name, metadata, deleted_at')
    .eq('id', client_id)
    .is('deleted_at', null)
    .maybeSingle()

  if (clientErr) {
    console.error('[strategy/generate] client error', { client_id, error: clientErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!client) return Response.json({ error: 'Client not found' }, { status: 404 })

  const meta = (client.metadata ?? {}) as ClientMetadata

  // Load voice profile
  const { data: vp } = await sb
    .from('wv_be_voice_profiles')
    .select('version, audience, one_word_tone, register, do_list, dont_list, signature_phrases, never_sound_like, forbidden_register')
    .eq('client_id', client_id)
    .maybeSingle<VoiceProfileRow>()

  // Build prompt
  const systemPrompt = buildSystemPrompt(client.display_name, vp ?? null, meta.brand_facts)
  const targetMonthLabel = new Date(targetYear, targetMonth - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const userPrompt = `Generate a content strategy for ${targetMonthLabel}. Return 3-5 pillars and 12-15 specific, ready-to-write topic stubs spread across the month.`

  // Call Claude
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const model = process.env.ANTHROPIC_MODEL_DRAFT ?? 'claude-sonnet-4-6'

  let pillars: ContentPillar[]
  let topics: TopicStub[]

  try {
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [STRATEGY_TOOL],
      tool_choice: { type: 'tool', name: 'save_content_strategy' },
    })

    const toolUse = msg.content.find((b) => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return Response.json({ error: 'Model did not return expected tool use' }, { status: 502 })
    }

    const strategyInput = toolUse.input as { pillars: ContentPillar[]; topics: TopicStub[] }
    pillars = strategyInput.pillars
    topics = strategyInput.topics
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[strategy/generate] Claude error', { client_id, error: msg })
    if (msg.includes('credit') || msg.includes('balance') || msg.includes('billing')) {
      return Response.json({ error: 'AI generation unavailable — API credits exhausted. Top up at console.anthropic.com.' }, { status: 503 })
    }
    return Response.json({ error: 'Strategy generation failed. Try again.' }, { status: 503 })
  }

  // Validate minimums
  if (pillars.length < 3) {
    return Response.json({ error: 'Model returned fewer than 3 pillars — retry' }, { status: 502 })
  }
  if (topics.length < 12) {
    return Response.json({ error: 'Model returned fewer than 12 topic stubs — retry' }, { status: 502 })
  }

  const targetMonthKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`

  // Persist to metadata.content_pillars
  const contentPillars: ContentPillarsMetadata = {
    generated_at: new Date().toISOString(),
    target_month: targetMonthKey,
    pillars,
    topics,
  }

  const { error: metaErr } = await sb
    .from('wv_be_clients')
    .update({ metadata: { ...meta, content_pillars: contentPillars } })
    .eq('id', client_id)

  if (metaErr) {
    console.error('[strategy/generate] metadata update error', { client_id, error: metaErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  // Get or create calendar for target month
  let calendarId: string
  try {
    calendarId = await getOrCreateCalendar(sb, client_id, targetYear, targetMonth, topics.length)
  } catch (err) {
    console.error('[strategy/generate] calendar error', { client_id, error: String(err) })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  // Find current max slot_index to avoid UNIQUE conflict
  const { data: existingSlots } = await sb
    .from('wv_be_calendar_slots')
    .select('slot_index')
    .eq('calendar_id', calendarId)
    .order('slot_index', { ascending: false })
    .limit(1)

  const startIndex = existingSlots?.[0]?.slot_index != null ? existingSlots[0].slot_index + 1 : 0

  // Insert slots
  const slotRows = topics.map((topic, i) => ({
    calendar_id: calendarId,
    client_id,
    slot_index: startIndex + i,
    channel: topic.channel,
    piece_type: topic.piece_type,
    scheduled_for: buildScheduledFor(targetYear, targetMonth, topic, i),
    topic_brief: topic.title,
    status: 'briefed',
    sla_state: 'na',
  }))

  const { error: slotsErr, count } = await sb
    .from('wv_be_calendar_slots')
    .insert(slotRows, { count: 'exact' })

  if (slotsErr) {
    console.error('[strategy/generate] slot insert error', { client_id, error: slotsErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  return Response.json({
    pillars,
    topics,
    slots_seeded: count ?? slotRows.length,
    calendar_id: calendarId,
    target_month: targetMonthKey,
  })
}
