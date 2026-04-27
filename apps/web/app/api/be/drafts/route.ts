// apps/web/app/api/be/drafts/route.ts
// Brand Engine Slice 3: voice-aware draft generation API
// Spec: 78-webvillage/docs/slice-3-drafts-api-spec-v1.md
//
// Flow:
//   1. Zod validation
//   2. Fetch client + voice_profile + template + banned_phrases (canon + per-client)
//   3. Assemble system prompt (template body_template + voice + banned phrases)
//   4. Anthropic Sonnet 4.6 generation call
//   5. Banned-phrase enforcer (per-phrase severity); on hard fail, retry once
//   6. Anthropic Haiku 4.5 scoring call (5-pillar JSON)
//   7. Compute final scores (with voice deduction for flag hits) + route to status band
//   8. Persist wv_be_drafts row + wv_be_scores row + 2 wv_be_audit_log rows
//   9. Return draft + scores + status

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { getAnthropic, MODELS } from '@/lib/anthropic'
import { computeCostCents } from '@/lib/anthropic-pricing'
import { assemblePrompt } from '@/lib/be-prompt-assembly'
import { enforceBannedPhrases, type EnforcerResult } from '@/lib/be-banned-phrase-enforcer'
import { deriveSourceType } from '@/lib/be-source-type-mapping'

export const runtime = 'nodejs'
export const maxDuration = 60  // up to 60s for Sonnet generation + Haiku scoring

const RequestSchema = z.object({
  client_id: z.string().uuid(),
  template_id: z.string().uuid(),
  prompt: z.string().min(10).max(8000),
  source_type: z
    .enum([
      'tool_post', 'tool_article', 'tool_bio', 'tool_featured_tile',
      'outreach_message', 'editorial_post', 'editorial_article', 'editorial_email',
      'reply',  // Slice 7
    ])
    .optional(),
  parent_draft_id: z.string().uuid().optional(),
  cluster_id: z.string().uuid().optional(),
  cluster_slot: z.number().int().optional(),
  outreach_sequence_id: z.string().uuid().optional(),
  outreach_step: z.number().int().optional(),
  inbox_event_id: z.string().uuid().optional(),  // Slice 7 — links reply drafts to inbox events
  vars: z.record(z.string(), z.string()).optional(),
})

interface ScoreResponse {
  provenance: number
  specificity: number
  structure: number
  voice: number
  utility: number
  rationale_per_pillar?: Record<string, string>
}

interface CallMeta {
  model: string
  tokens_in: number
  tokens_out: number
  cost_cents: number
  latency_ms: number
}

export async function POST(req: NextRequest) {
  // 1. Parse + validate
  let body: z.infer<typeof RequestSchema>
  try {
    const json = await req.json()
    body = RequestSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  // 2. Fetch client, voice profile, template, banned phrases
  const [
    { data: client, error: clientErr },
    { data: voiceProfile, error: vpErr },
    { data: template, error: tplErr },
    { data: bannedCanon },
    { data: bannedClient },
  ] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', body.client_id).is('deleted_at', null).single(),
    sb.from('wv_be_voice_profiles').select('*').eq('client_id', body.client_id).maybeSingle(),
    sb.from('wv_be_templates').select('*').eq('id', body.template_id).is('deleted_at', null).single(),
    sb.from('wv_be_banned_phrases_canon').select('phrase, category, severity, rationale').eq('active', true),
    sb.from('wv_be_client_banned_phrases').select('phrase, category, severity, rationale').eq('client_id', body.client_id).is('deleted_at', null),
  ])

  if (clientErr || !client) {
    return NextResponse.json({ error: 'client_not_found' }, { status: 404 })
  }
  if (vpErr || !voiceProfile) {
    return NextResponse.json({ error: 'voice_profile_required', detail: 'No voice profile exists for this client. Create one at /admin/brand-engine/[id]/voice first.' }, { status: 412 })
  }
  if (tplErr || !template) {
    return NextResponse.json({ error: 'template_not_found' }, { status: 404 })
  }
  // Verify template visibility for this client (canon = visible to all; override = client_id must match)
  if (!template.is_default && template.client_id !== body.client_id) {
    return NextResponse.json({ error: 'template_not_visible_to_client' }, { status: 404 })
  }

  // Merge banned phrases: client overrides win on phrase collision
  const bannedMap = new Map<string, { phrase: string; category: string | null; severity: 'block' | 'flag'; rationale: string | null }>()
  for (const b of bannedCanon ?? []) bannedMap.set(b.phrase.toLowerCase(), b as never)
  for (const b of bannedClient ?? []) bannedMap.set(b.phrase.toLowerCase(), b as never)
  const allBanned = Array.from(bannedMap.values())

  // 3. Assemble system prompt
  const systemPrompt = assemblePrompt({
    templateBody: template.body_template,
    brandName: client.display_name,
    voiceProfile: voiceProfile,
    prompt: body.prompt,
    bannedPhrases: allBanned,
    vars: body.vars,
  })

  // 4. Generation call (with retry-once on hard banned-phrase fail)
  const anthropic = getAnthropic()
  let draftBody: string
  let genMeta: CallMeta
  let enforcer: EnforcerResult
  let retryCount = 0

  try {
    const t0 = Date.now()
    const resp = await anthropic.messages.create({
      model: MODELS.generation,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Generate the ${template.template_type} per the system instructions above.` },
      ],
    })
    const latency_ms = Date.now() - t0
    draftBody = resp.content[0]?.type === 'text' ? resp.content[0].text : ''
    genMeta = {
      model: MODELS.generation,
      tokens_in: resp.usage.input_tokens,
      tokens_out: resp.usage.output_tokens,
      cost_cents: computeCostCents(MODELS.generation, resp.usage.input_tokens, resp.usage.output_tokens),
      latency_ms,
    }
    enforcer = enforceBannedPhrases(draftBody, allBanned)

    // Retry once on hard fail
    if (enforcer.hasHardFail) {
      retryCount = 1
      const retryPrompt =
        systemPrompt +
        `\n\nIMPORTANT: The previous attempt contained these BANNED phrases: ${enforcer.blockHits.map((h) => `"${h.phrase}"`).join(', ')}. Rewrite without them.`
      const t1 = Date.now()
      const resp2 = await anthropic.messages.create({
        model: MODELS.generation,
        max_tokens: 4000,
        system: retryPrompt,
        messages: [
          { role: 'user', content: `Regenerate the ${template.template_type}, this time avoiding the banned phrases listed at the bottom of the system prompt.` },
        ],
      })
      const latency_ms2 = Date.now() - t1
      draftBody = resp2.content[0]?.type === 'text' ? resp2.content[0].text : ''
      genMeta = {
        model: MODELS.generation,
        tokens_in: genMeta.tokens_in + resp2.usage.input_tokens,
        tokens_out: genMeta.tokens_out + resp2.usage.output_tokens,
        cost_cents: genMeta.cost_cents + computeCostCents(MODELS.generation, resp2.usage.input_tokens, resp2.usage.output_tokens),
        latency_ms: latency_ms + latency_ms2,
      }
      enforcer = enforceBannedPhrases(draftBody, allBanned)
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'generation_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  // 5. Score with Haiku 4.5
  const scoringRubric = `You are a content quality scorer for ${client.display_name}. Score the draft against 5 pillars.

DRAFT TO SCORE:
"""
${draftBody}
"""

VOICE PROFILE FOR REFERENCE:
- One-word tone: ${voiceProfile.one_word_tone ?? 'n/a'}
- Register: ${voiceProfile.register ?? 'n/a'}
- Do: ${(voiceProfile.do_list ?? []).join(' / ')}
- Don't: ${(voiceProfile.dont_list ?? []).join(' / ')}

5 PILLARS (each 0-100):
1. Provenance — claims backed by sources / data / first-hand knowledge (no fabrication)
2. Specificity — concrete numbers, names, dates (not vague generalities)
3. Structure — logical flow, scannable, appropriate length for format
4. Voice — matches the voice profile above (tone, register, do/don't list)
5. Utility — reader leaves knowing/able to do something they couldn't before

Return ONLY valid JSON (no markdown, no commentary, no code fences):
{"provenance":<int 0-100>,"specificity":<int 0-100>,"structure":<int 0-100>,"voice":<int 0-100>,"utility":<int 0-100>,"rationale_per_pillar":{"provenance":"<one sentence>","specificity":"<one sentence>","structure":"<one sentence>","voice":"<one sentence>","utility":"<one sentence>"}}`

  let scoreResp: ScoreResponse
  let scoreMeta: CallMeta
  try {
    const t0 = Date.now()
    const sresp = await anthropic.messages.create({
      model: MODELS.scoring,
      max_tokens: 1000,
      messages: [{ role: 'user', content: scoringRubric }],
    })
    const latency_ms = Date.now() - t0
    const rawText = sresp.content[0]?.type === 'text' ? sresp.content[0].text : '{}'
    // Strip code fences if Haiku returns them despite instructions
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/, '')
      .replace(/\s*```$/, '')
      .trim()
    scoreResp = JSON.parse(cleaned)
    scoreMeta = {
      model: MODELS.scoring,
      tokens_in: sresp.usage.input_tokens,
      tokens_out: sresp.usage.output_tokens,
      cost_cents: computeCostCents(MODELS.scoring, sresp.usage.input_tokens, sresp.usage.output_tokens),
      latency_ms,
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'scoring_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  // 6. Apply voice-pillar deduction for flag hits + compute average
  const voiceAdjusted = Math.max(0, Math.min(100, scoreResp.voice + enforcer.voiceScoreDeduction))
  const finalScores = {
    provenance: scoreResp.provenance,
    specificity: scoreResp.specificity,
    structure: scoreResp.structure,
    voice: voiceAdjusted,
    utility: scoreResp.utility,
  }
  const average =
    (finalScores.provenance + finalScores.specificity + finalScores.structure + finalScores.voice + finalScores.utility) /
    5

  // 7. Status routing
  // Slice 7 reply-specific gating per Q7-8: replies are 1-3 sentences; long-form Strict bands
  // would reject every reply (hard to score 70+ on Structure for "Yes! Try our Ramadan calculator.")
  // → use voice + specificity gating only for source_type='reply'.
  const isReply = body.source_type === 'reply'

  let status: 'approved' | 'generated' | 'rejected'
  let passes_threshold: boolean

  if (isReply) {
    // Slice 7 lock: replies pass when (no hard fail) AND voice >= 70 AND specificity >= 50
    const voiceOk = finalScores.voice >= 70
    const specificityOk = finalScores.specificity >= 50
    passes_threshold = !enforcer.hasHardFail && voiceOk && specificityOk

    if (enforcer.hasHardFail && retryCount >= 1) {
      status = 'rejected'
    } else if (finalScores.voice >= 85 && finalScores.specificity >= 70) {
      status = 'approved'  // UI hint: "recommended" variant
    } else if (passes_threshold) {
      status = 'generated'
    } else {
      // Voice OR specificity below floor — still surface as generated (de-emphasized in UI)
      // per spec §6 "Listed but visually de-emphasized"
      status = 'generated'
    }
  } else {
    // Slice 3 Strict bands (long-form default)
    if (enforcer.hasHardFail && retryCount >= 1) {
      status = 'rejected'
    } else if (average >= 85) {
      status = 'approved'
    } else if (average >= 60) {
      status = 'generated'
    } else {
      status = 'rejected'
    }
    passes_threshold = average >= 60 && !enforcer.hasHardFail
  }

  // 8. Persist draft row
  const sourceType =
    body.source_type ?? deriveSourceType(template.template_type as never, voiceProfile.quality_tier as never)
  const { data: draftRow, error: draftErr } = await sb
    .from('wv_be_drafts')
    .insert({
      client_id: body.client_id,
      author_user_id: null,
      source_type: sourceType,
      template_id: body.template_id,
      voice_profile_version: (voiceProfile as { version: number }).version,
      prompt_text: body.prompt,
      draft_body: draftBody,
      platform: template.platform,
      language: 'en',  // TODO Slice 9: per-client language
      cluster_id: body.cluster_id ?? null,
      cluster_slot: body.cluster_slot ?? null,
      outreach_sequence_id: body.outreach_sequence_id ?? null,
      outreach_step: body.outreach_step ?? null,
      status,
      generation_model: MODELS.generation,
      generation_tokens_in: genMeta.tokens_in,
      generation_tokens_out: genMeta.tokens_out,
      generation_cost_cents: genMeta.cost_cents,
      generated_at: new Date().toISOString(),
      parent_draft_id: body.parent_draft_id ?? null,
      inbox_event_id: body.inbox_event_id ?? null,  // Slice 7
    })
    .select('id, generated_at')
    .single()

  if (draftErr || !draftRow) {
    return NextResponse.json(
      { error: 'draft_persist_failed', detail: draftErr?.message ?? 'unknown' },
      { status: 500 }
    )
  }

  // Persist score row
  const { error: scoreErr } = await sb.from('wv_be_scores').insert({
    draft_id: draftRow.id,
    draft_generated_at: draftRow.generated_at,
    client_id: body.client_id,
    scored_at: new Date().toISOString(),
    scoring_model: MODELS.scoring,
    scores: { ...finalScores, average, rationale_per_pillar: scoreResp.rationale_per_pillar },
    flags: {
      hard_fail: enforcer.hasHardFail,
      retry_count: retryCount,
      flag_count: enforcer.flagHits.length,
      voice_score_deduction: enforcer.voiceScoreDeduction,
    },
    banned_phrase_hits: enforcer.hits.map((h) => h.phrase),
    passes_threshold,
    rubric_version: 1,
  })
  if (scoreErr) {
    console.error('[drafts API] score persist failed:', scoreErr)
    // Continue; draft persisted, return what we have
  }

  // Audit log: 2 rows (gen + score)
  await sb.from('wv_be_audit_log').insert([
    {
      client_id: body.client_id,
      actor_user_id: null,
      actor_type: 'system',
      action: 'draft_generation',
      target_table: 'wv_be_drafts',
      target_id: draftRow.id,
      after_state: {
        ...genMeta,
        template_id: body.template_id,
        voice_profile_version: (voiceProfile as { version: number }).version,
        retry_count: retryCount,
      },
    },
    {
      client_id: body.client_id,
      actor_user_id: null,
      actor_type: 'system',
      action: 'draft_scoring',
      target_table: 'wv_be_drafts',
      target_id: draftRow.id,
      after_state: {
        ...scoreMeta,
        scores: finalScores,
        average,
        banned_phrase_hits: enforcer.hits.map((h) => h.phrase),
      },
    },
  ])

  // 9. Return
  return NextResponse.json({
    draft_id: draftRow.id,
    draft_body: draftBody,
    status,
    scores: { ...finalScores, average },
    passes_threshold,
    banned_phrase_hits: enforcer.hits.map((h) => h.phrase),
    flags: {
      hard_fail: enforcer.hasHardFail,
      retry_count: retryCount,
      flag_count: enforcer.flagHits.length,
      voice_score_deduction: enforcer.voiceScoreDeduction,
    },
    generation: genMeta,
    scoring: scoreMeta,
  })
}
