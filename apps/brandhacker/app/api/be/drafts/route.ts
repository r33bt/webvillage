/**
 * POST /api/be/drafts
 * BrandHacker core drafting + scoring engine (Phase 1 -- dogfood).
 *
 * Flow:
 *  1.  Auth check (x-bh-internal header or BH_INTERNAL_TOKEN env)
 *  2.  Zod validation of request body { client_id, prompt, channel?, format? }
 *  3.  Upstash rate limiting -- 20 req / 5 min per client_id (fail-open)
 *  4.  Load tenant (wv_be_clients) -- 404 if missing, 503 if suspended
 *  5.  Load voice profile (wv_be_voice_profiles)
 *  6.  Load banned phrases (wv_be_banned_phrases_canon + wv_be_client_banned_phrases)
 *  7.  Load template (client-specific channel/format match -> client any -> WV default channel -> WV default any)
 *  8.  Build system prompt (voice profile + channel hook + banned phrases + template body)
 *  9.  Call Anthropic claude-sonnet-4-6 to draft (3x retry w/ backoff + haiku fallback)
 * 10.  Call Anthropic claude-haiku-4-5-20251001 to score 5 pillars (0-10 each)
 * 11.  Banned phrase check (case-insensitive)
 * 12.  Persist draft -> wv_be_drafts; score -> wv_be_scores
 * 13.  Return { draft_id, generated_at, draft_body, scores, banned_phrase_hits, passes_threshold }
 */

import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { z } from 'zod'
import { getServiceRoleClient, type VoiceProfileRow } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Channel = 'linkedin' | 'instagram' | 'x' | 'tiktok' | 'facebook' | 'youtube'
type Format = 'post' | 'thread' | 'carousel' | 'reel' | 'short' | 'long_form_article'

type TemplateRow = {
  id: string
  client_id: string | null
  template_type: string
  platform: string | null
  name: string
  body_template: string
  variables: Record<string, unknown> | null
}

type DraftInsertResult = {
  id: string
  generated_at: string
}

type RawPillarScores = {
  provenance: number
  specificity: number
  structure: number
  voice: number
  utility: number
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const VALID_CHANNELS = ['linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'youtube'] as const
const VALID_FORMATS = [
  'post',
  'thread',
  'carousel',
  'reel',
  'short',
  'long_form_article',
] as const

const RequestSchema = z.object({
  client_id: z.string().uuid({ message: 'client_id must be a valid UUID' }),
  prompt: z.string().min(1, 'prompt is required').max(5000, 'prompt must be <=5000 characters'),
  channel: z.enum(VALID_CHANNELS).optional(),
  format: z.enum(VALID_FORMATS).optional(),
})

type ValidatedRequest = z.infer<typeof RequestSchema>

// ---------------------------------------------------------------------------
// Auth check
// ---------------------------------------------------------------------------

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.BH_INTERNAL_TOKEN
  if (!token) return true // dev mode: no token configured -- allow all
  const header = req.headers.get('x-bh-internal')
  return header === token || header === 'true'
}

// ---------------------------------------------------------------------------
// Rate limiter (fail-open when Redis unavailable)
// ---------------------------------------------------------------------------

function buildRatelimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    return new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.tokenBucket(20, '5 m', 20),
      prefix: 'bh:drafts',
    })
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Anthropic client (lazy singleton)
// ---------------------------------------------------------------------------

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _anthropic
}

// ---------------------------------------------------------------------------
// Retry helper -- exponential backoff, retries on 429 / 5xx only
// ---------------------------------------------------------------------------

type RetryableError = { status?: number }

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 4,
  delaysMs: number[] = [1000, 4000, 16000],
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const status = (err as RetryableError).status
      const retryable = status === 429 || (status != null && status >= 500)
      if (!retryable || attempt === maxAttempts - 1) break
      await new Promise((res) => setTimeout(res, delaysMs[attempt] ?? 16000))
    }
  }
  throw lastError
}

// ---------------------------------------------------------------------------
// Per-channel formatting hooks (sourced from pb-editorial-social.md)
// ---------------------------------------------------------------------------

const CHANNEL_HOOKS: Record<Channel, string> = {
  linkedin: [
    'CHANNEL: LinkedIn',
    '- Target length: 1300-2500 characters',
    '- Format: thought leadership -- lead with a concrete insight, not a question',
    '- Structure: hook line -> 3-5 paragraphs -> one verb-led CTA',
    '- Hashtags: <=5, placed after body, topic-specific only',
    '- No exclamation marks beyond the first sentence',
  ].join('\n'),
  x: [
    'CHANNEL: X (Twitter)',
    '- Each tweet: 240-270 characters',
    '- Thread length: 5-12 tweets',
    '- Tweet 1 (hook): no thread numbering, standalone if retweeted',
    '- Final tweet: closer + verb-led CTA',
    '- Output as JSON array: [{"i":1,"text":"..."}, ...]',
    '- Hashtags: 1-2 per thread, in final tweet only',
  ].join('\n'),
  instagram: [
    'CHANNEL: Instagram',
    '- Caption: 150-500 characters',
    '- Hashtag block (separate from caption): <=10 tags',
    '- Hook in first line (truncated at 125 chars on feed)',
    '- Emojis allowed sparingly (<=3)',
    '- Output as JSON: {"caption":"...","hashtags":["#tag1",...]}',
  ].join('\n'),
  tiktok: [
    'CHANNEL: TikTok',
    '- Caption: 100-300 characters',
    '- Hashtags: 3-5, integrated into caption or at end',
    '- Punchy -- first 3 words matter most',
    '- Written as if the creator is speaking it aloud',
    '- Output ONLY the caption text',
  ].join('\n'),
  facebook: [
    'CHANNEL: Facebook',
    '- Target length: 100-300 characters',
    '- Story-led opening (personal or anecdotal)',
    '- One closing question to invite comments',
    '- Output ONLY the post body',
  ].join('\n'),
  youtube: [
    'CHANNEL: YouTube',
    '- Description: 200-500 characters',
    '- Front-load keywords and value proposition in first 2 sentences',
    '- Include 3-5 chapter timestamps if appropriate (format: 0:00 Intro)',
    '- End with one CTA (subscribe or linked resource)',
    '- Output ONLY the description text',
  ].join('\n'),
}

// ---------------------------------------------------------------------------
// Source type mapping
// ---------------------------------------------------------------------------

function resolveSourceType(format?: Format): string {
  return format === 'long_form_article' ? 'tool_article' : 'tool_post'
}

function resolveTemplateType(format?: Format): string {
  return format === 'long_form_article' ? 'long_form_article' : 'post'
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  displayName: string,
  vp: VoiceProfileRow,
  bannedPhrases: string[],
  templateBody: string | null,
  channel: Channel | undefined,
): string {
  const parts: string[] = [
    `You are a professional content writer creating content for ${displayName}.`,
    '',
    '## Voice profile',
  ]

  if (vp.audience) parts.push(`- Audience: ${vp.audience}`)
  if (vp.one_word_tone) {
    parts.push(`- Tone: ${vp.one_word_tone}${vp.register ? ` (${vp.register})` : ''}`)
  }
  if (vp.do_list?.length) parts.push(`- Always do: ${vp.do_list.join('; ')}`)
  if (vp.dont_list?.length) parts.push(`- Never do: ${vp.dont_list.join('; ')}`)
  if (vp.signature_phrases?.length) {
    parts.push(`- Signature phrases (use sparingly, max 1): ${vp.signature_phrases.join('; ')}`)
  }
  if (vp.never_sound_like?.length) {
    parts.push(`- Never sound like: ${vp.never_sound_like.join('; ')}`)
  }
  if (vp.forbidden_register?.length) {
    parts.push(`- Forbidden register/style: ${vp.forbidden_register.join('; ')}`)
  }

  if (bannedPhrases.length) {
    parts.push('', '## Banned phrases -- never use, rewrite if they appear')
    for (const p of bannedPhrases) parts.push(`- ${p}`)
  }

  if (channel && CHANNEL_HOOKS[channel]) {
    parts.push('', CHANNEL_HOOKS[channel])
  }

  if (templateBody) {
    parts.push('', '## Template guidance', templateBody)
  }

  parts.push(
    '',
    'OUTPUT: Produce ONLY the final content. No preamble, no meta-commentary, no "Here is your post:" framing.',
  )

  return parts.join('\n')
}

const SCORING_SYSTEM_PROMPT = `You are a content quality evaluator. Score the content on 5 pillars (0-10 each).

Pillars:
- provenance: Is the author perspective clear? Are factual claims sourceable or attributed?
- specificity: Concrete numbers, names, dates, examples -- not vague generalities?
- structure: Hook in first line? Logical flow? Appropriate length for the channel?
- voice: Distinct human brand voice? Zero AI-slop phrases ("delve into", "In today's fast-paced world", "leverage", etc.)?
- utility: Does the reader leave knowing or able to do something they could not before?

Respond ONLY with valid JSON -- no markdown, no prose before or after.
Schema: {"provenance":N,"specificity":N,"structure":N,"voice":N,"utility":N}`

function buildScoringUserPrompt(draftBody: string, channel: Channel | undefined): string {
  return [
    `Channel: ${channel ?? 'social media'}`,
    '',
    'Content to score:',
    '"""',
    draftBody,
    '"""',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Banned phrase check
// ---------------------------------------------------------------------------

function findBannedPhraseHits(content: string, phrases: string[]): string[] {
  if (!phrases.length) return []
  const lower = content.toLowerCase()
  return phrases.filter((p) => lower.includes(p.toLowerCase()))
}

// ---------------------------------------------------------------------------
// Cost estimation
// ---------------------------------------------------------------------------

const COST_PER_TOKEN_IN_USD = 0.000003
const COST_PER_TOKEN_OUT_USD = 0.000015

function estimateCostCents(tokensIn: number, tokensOut: number): number {
  return Math.round(
    (tokensIn * COST_PER_TOKEN_IN_USD + tokensOut * COST_PER_TOKEN_OUT_USD) * 100,
  )
}

// ---------------------------------------------------------------------------
// Template lookup (waterfall: client+channel -> client any -> WV default channel -> WV default any)
// ---------------------------------------------------------------------------

async function fetchBestTemplate(
  sb: ReturnType<typeof getServiceRoleClient>,
  clientId: string,
  templateType: string,
  channel: Channel | undefined,
): Promise<TemplateRow | null> {
  const base = () =>
    sb
      .from('wv_be_templates')
      .select('id, client_id, template_type, platform, name, body_template, variables')
      .is('deleted_at', null)
      .eq('template_type', templateType)

  // 1. Client-specific + channel match
  if (channel) {
    const { data } = await base()
      .eq('client_id', clientId)
      .eq('platform', channel)
      .limit(1)
      .maybeSingle<TemplateRow>()
    if (data) return data
  }

  // 2. Client-specific, any channel
  {
    const { data } = await base()
      .eq('client_id', clientId)
      .limit(1)
      .maybeSingle<TemplateRow>()
    if (data) return data
  }

  // 3. WV default + channel match
  if (channel) {
    const { data } = await base()
      .is('client_id', null)
      .eq('is_default', true)
      .eq('platform', channel)
      .limit(1)
      .maybeSingle<TemplateRow>()
    if (data) return data
  }

  // 4. WV default, any channel
  {
    const { data } = await base()
      .is('client_id', null)
      .eq('is_default', true)
      .limit(1)
      .maybeSingle<TemplateRow>()
    if (data) return data
  }

  return null
}

// ---------------------------------------------------------------------------
// POST /api/be/drafts
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Auth
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse + Zod validate
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

  const { client_id, prompt, channel, format }: ValidatedRequest = parsed.data

  // 3. Rate limiting (fail-open)
  const limiter = buildRatelimiter()
  if (limiter) {
    try {
      const { success } = await limiter.limit(client_id)
      if (!success) {
        return Response.json(
          { error: 'Rate limit exceeded. Try again in a few minutes.' },
          { status: 429, headers: { 'Retry-After': '300' } },
        )
      }
    } catch (err) {
      console.error('[be/drafts] rate-limit check failed -- failing open', {
        client_id,
        error: String(err),
      })
    }
  }

  const sb = getServiceRoleClient()

  // 4. Load tenant
  const { data: client, error: clientErr } = await sb
    .from('wv_be_clients')
    .select('id, display_name, current_tier, metadata, deleted_at')
    .eq('id', client_id)
    .is('deleted_at', null)
    .maybeSingle()

  if (clientErr) {
    console.error('[be/drafts] client lookup error', { client_id, error: clientErr.message })
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

  // Free tier: 20 drafts/month cap
  if (client.current_tier === 'free') {
    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)
    const { count } = await sb
      .from('wv_be_drafts')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', client_id)
      .gte('generated_at', monthStart.toISOString())
    if ((count ?? 0) >= 20) {
      return Response.json(
        { error: 'Free plan limit reached — 20 drafts per month. Upgrade to Starter for unlimited drafts.' },
        { status: 429 },
      )
    }
  }

  // 5. Load voice profile
  const { data: vp, error: vpErr } = await sb
    .from('wv_be_voice_profiles')
    .select(
      'version, audience, one_word_tone, register, do_list, dont_list, ' +
        'signature_phrases, never_sound_like, forbidden_register',
    )
    .eq('client_id', client_id)
    .maybeSingle<VoiceProfileRow>()

  if (vpErr) {
    console.error('[be/drafts] voice profile lookup error', { client_id, error: vpErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  const voiceProfileVersion = vp?.version ?? 1

  // 6. Load banned phrases (parallel)
  const [canonRes, clientPhrasesRes] = await Promise.all([
    sb.from('wv_be_banned_phrases_canon').select('phrase').eq('active', true),
    sb
      .from('wv_be_client_banned_phrases')
      .select('phrase')
      .eq('client_id', client_id)
      .is('deleted_at', null),
  ])

  const allBannedPhrases = [
    ...(canonRes.data ?? []).map((r: { phrase: string }) => r.phrase),
    ...(clientPhrasesRes.data ?? []).map((r: { phrase: string }) => r.phrase),
  ]

  // 7. Load template (waterfall)
  const templateType = resolveTemplateType(format)
  const template = await fetchBestTemplate(sb, client_id, templateType, channel)
  const templateId = template?.id ?? null

  // 8. Build system prompt
  const systemPrompt = buildSystemPrompt(
    client.display_name,
    vp ?? ({ version: 1 } as VoiceProfileRow),
    allBannedPhrases,
    template?.body_template ?? null,
    channel,
  )

  // 9. Draft via claude-sonnet-4-6 (retry + haiku fallback)
  const primaryModel = process.env.ANTHROPIC_MODEL_DRAFT ?? 'claude-sonnet-4-6'
  const fallbackModel = process.env.ANTHROPIC_MODEL_FALLBACK ?? 'claude-haiku-4-5-20251001'

  let draftContent = ''
  let usedFallbackModel = false
  let modelUsed = primaryModel
  let tokensIn = 0
  let tokensOut = 0

  const anthropic = getAnthropic()

  const callDraft = (model: string) =>
    withRetry(() =>
      anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    )

  try {
    const msg = await callDraft(primaryModel)
    const block = msg.content.at(0)
    draftContent = block?.type === 'text' ? block.text.trim() : ''
    tokensIn = msg.usage.input_tokens
    tokensOut = msg.usage.output_tokens
  } catch (primaryErr) {
    console.error('[be/drafts] primary model exhausted, trying fallback', {
      client_id,
      error: String(primaryErr),
    })
    try {
      const fallbackMsg = await callDraft(fallbackModel)
      const block = fallbackMsg.content.at(0)
      draftContent = block?.type === 'text' ? block.text.trim() : ''
      tokensIn = fallbackMsg.usage.input_tokens
      tokensOut = fallbackMsg.usage.output_tokens
      usedFallbackModel = true
      modelUsed = fallbackModel
    } catch (fallbackErr) {
      console.error('[be/drafts] fallback model also exhausted', {
        client_id,
        error: String(fallbackErr),
      })
      return Response.json(
        { error: 'Draft generation temporarily unavailable. Try again in a few minutes.' },
        { status: 503 },
      )
    }
  }

  if (!draftContent) {
    console.error('[be/drafts] empty content from model', { client_id })
    return Response.json(
      { error: 'Draft generation temporarily unavailable. Try again in a few minutes.' },
      { status: 503 },
    )
  }

  // 10. Score via claude-haiku-4-5-20251001 (non-fatal -- zero scores stored on failure)
  const scoringModel = process.env.ANTHROPIC_MODEL_SCORE ?? 'claude-haiku-4-5-20251001'

  let scores: RawPillarScores = {
    provenance: 0,
    specificity: 0,
    structure: 0,
    voice: 0,
    utility: 0,
  }

  try {
    const scoreMsg = await withRetry(() =>
      anthropic.messages.create({
        model: scoringModel,
        max_tokens: 256,
        system: SCORING_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildScoringUserPrompt(draftContent, channel) }],
      }),
    )
    const block = scoreMsg.content.at(0)
    if (block?.type === 'text') {
      const raw = JSON.parse(block.text.trim()) as Partial<RawPillarScores>
      scores = {
        provenance: Number(raw.provenance ?? 0),
        specificity: Number(raw.specificity ?? 0),
        structure: Number(raw.structure ?? 0),
        voice: Number(raw.voice ?? 0),
        utility: Number(raw.utility ?? 0),
      }
    }
  } catch (scoreErr) {
    console.error('[be/drafts] scoring failed -- storing zero scores', {
      client_id,
      error: String(scoreErr),
    })
  }

  const scoreOverall =
    Math.round(
      ((scores.provenance +
        scores.specificity +
        scores.structure +
        scores.voice +
        scores.utility) /
        5) *
        10,
    ) / 10
  const passesThreshold = scoreOverall >= 7.0

  // 11. Banned phrase check
  const bannedHits = findBannedPhraseHits(draftContent, allBannedPhrases)

  // 12. Persist draft
  const generatedAt = new Date().toISOString()

  const { data: draftRow, error: draftInsertErr } = await sb
    .from('wv_be_drafts')
    .insert({
      client_id,
      source_type: resolveSourceType(format),
      template_id: templateId,
      voice_profile_version: voiceProfileVersion,
      prompt_text: prompt,
      draft_body: draftContent,
      platform: channel ?? null,
      generation_model: modelUsed,
      generation_tokens_in: tokensIn,
      generation_tokens_out: tokensOut,
      generation_cost_cents: estimateCostCents(tokensIn, tokensOut),
      generated_at: generatedAt,
      status: 'generated',
    })
    .select('id, generated_at')
    .single<DraftInsertResult>()

  if (draftInsertErr || !draftRow) {
    console.error('[be/drafts] draft insert error', {
      client_id,
      error: draftInsertErr?.message,
    })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  const { error: scoreInsertErr } = await sb.from('wv_be_scores').insert({
    draft_id: draftRow.id,
    draft_generated_at: draftRow.generated_at,
    client_id,
    scoring_model: scoringModel,
    scores: {
      provenance: scores.provenance,
      specificity: scores.specificity,
      structure: scores.structure,
      voice: scores.voice,
      utility: scores.utility,
      overall: scoreOverall,
    },
    flags: bannedHits.map((phrase) => ({ type: 'banned_phrase', phrase, severity: 'flag' })),
    banned_phrase_hits: bannedHits,
    passes_threshold: passesThreshold,
    rubric_version: 1,
  })

  if (scoreInsertErr) {
    console.error('[be/drafts] score insert error (non-fatal)', {
      client_id,
      draft_id: draftRow.id,
      error: scoreInsertErr.message,
    })
  }

  // 13. Return 201
  return Response.json(
    {
      draft_id: draftRow.id,
      generated_at: draftRow.generated_at,
      draft_body: draftContent,
      scores: {
        provenance: scores.provenance,
        specificity: scores.specificity,
        structure: scores.structure,
        voice: scores.voice,
        utility: scores.utility,
        overall: scoreOverall,
      },
      banned_phrase_hits: bannedHits,
      passes_threshold: passesThreshold,
      // Additional diagnostic fields
      _meta: {
        model_used: modelUsed,
        used_fallback_model: usedFallbackModel,
        template_id: templateId,
        platform: channel ?? null,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        cost_cents: estimateCostCents(tokensIn, tokensOut),
      },
    },
    { status: 201 },
  )
}
