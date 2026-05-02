/**
 * POST /api/be/voice/extract
 * Analyses writing samples and extracts a structured voice profile for the tenant.
 *
 * Flow:
 *  1. Auth check (requireAuth — authenticated user only)
 *  2. Zod validation { tenant_id, samples }
 *  3. Ownership check (wv_be_client_users)
 *  4. Claude Haiku tool-use → extract_voice_profile
 *  5. Upsert into wv_be_voice_profiles (increments version on update)
 *  6. Return { profile, version }
 */

import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { getServiceRoleClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  tenant_id: z.string().uuid({ message: 'tenant_id must be a valid UUID' }),
  samples: z
    .string()
    .min(100, 'We need at least 100 characters to extract a voice profile')
    .max(10000, 'samples must be ≤10,000 characters'),
})

// ---------------------------------------------------------------------------
// Voice extraction tool definition
// ---------------------------------------------------------------------------

const VOICE_TOOL: Anthropic.Tool = {
  name: 'extract_voice_profile',
  description:
    'Extract a structured, reusable voice profile from writing samples. Be specific and concrete — avoid generic descriptors.',
  input_schema: {
    type: 'object',
    properties: {
      audience: {
        type: 'string',
        description:
          'Who is the primary audience? One precise sentence (e.g. "Early-stage founders making their first hire").',
      },
      one_word_tone: {
        type: 'string',
        description:
          'One adjective that best captures the overall tone (e.g. direct, warm, incisive, measured).',
      },
      register: {
        type: 'string',
        enum: ['formal', 'conversational', 'technical', 'editorial', 'casual'],
        description: 'The communication register that best describes these samples.',
      },
      do_list: {
        type: 'array',
        items: { type: 'string' },
        description:
          '3–5 specific things this voice consistently does (e.g. "Opens with a concrete claim, not a question").',
        minItems: 2,
        maxItems: 6,
      },
      dont_list: {
        type: 'array',
        items: { type: 'string' },
        description:
          '3–5 specific things this voice never does (e.g. "Never uses passive voice in CTAs").',
        minItems: 2,
        maxItems: 6,
      },
      signature_phrases: {
        type: 'array',
        items: { type: 'string' },
        description:
          '1–3 distinctive phrases, sentence openers, or structural patterns unique to this voice.',
        minItems: 1,
        maxItems: 4,
      },
      never_sound_like: {
        type: 'array',
        items: { type: 'string' },
        description:
          '2–3 reference points this voice should never resemble (e.g. "corporate HR comms", "academic abstract").',
        minItems: 1,
        maxItems: 4,
      },
      forbidden_register: {
        type: 'array',
        items: { type: 'string' },
        description: '1–3 registers or styles that are completely off-brand.',
        minItems: 1,
        maxItems: 4,
      },
    },
    required: [
      'audience',
      'one_word_tone',
      'register',
      'do_list',
      'dont_list',
      'signature_phrases',
      'never_sound_like',
    ],
  },
}

// ---------------------------------------------------------------------------
// POST /api/be/voice/extract
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Auth
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult

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

  const { tenant_id, samples } = parsed.data
  const sb = getServiceRoleClient()

  // 3. Verify ownership
  const { data: membership } = await sb
    .from('wv_be_client_users')
    .select('client_id')
    .eq('client_id', tenant_id)
    .eq('user_id', authResult.user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!membership) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 4. Call Claude Haiku for voice extraction
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Voice extraction temporarily unavailable.' },
      { status: 503 },
    )
  }

  let voiceData: Record<string, unknown>
  try {
    const anthropic = new Anthropic({ apiKey })
    const model = process.env.ANTHROPIC_MODEL_SCORE ?? 'claude-haiku-4-5-20251001'

    const msg = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      tools: [VOICE_TOOL],
      tool_choice: { type: 'tool', name: 'extract_voice_profile' },
      messages: [
        {
          role: 'user',
          content: `Analyse these writing samples and extract a precise, reusable voice profile.\n\nSAMPLES:\n"""\n${samples}\n"""`,
        },
      ],
    })

    const toolUse = msg.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    )
    if (!toolUse) throw new Error('Model did not return a tool_use block')
    voiceData = toolUse.input as Record<string, unknown>
  } catch (err) {
    const errStr = String(err)
    const isCredits =
      errStr.toLowerCase().includes('credit') ||
      errStr.toLowerCase().includes('quota') ||
      errStr.toLowerCase().includes('billing') ||
      errStr.toLowerCase().includes('insufficient')
    if (isCredits) {
      return Response.json(
        {
          error:
            'Voice extraction requires Anthropic API credits. Add credits at console.anthropic.com, then try again. Your samples are saved.',
        },
        { status: 503 },
      )
    }
    console.error('[voice/extract] extraction failed', { tenant_id, error: errStr })
    return Response.json(
      { error: 'Voice extraction temporarily unavailable. Try again.' },
      { status: 503 },
    )
  }

  // 5. Upsert voice profile (increment version on update)
  const { data: existing } = await sb
    .from('wv_be_voice_profiles')
    .select('version')
    .eq('client_id', tenant_id)
    .maybeSingle()

  const nextVersion = existing ? (existing.version ?? 1) + 1 : 1

  const profilePayload = {
    client_id: tenant_id,
    audience: (voiceData.audience as string) ?? null,
    one_word_tone: (voiceData.one_word_tone as string) ?? null,
    register: (voiceData.register as string) ?? null,
    do_list: (voiceData.do_list as string[]) ?? null,
    dont_list: (voiceData.dont_list as string[]) ?? null,
    signature_phrases: (voiceData.signature_phrases as string[]) ?? null,
    never_sound_like: (voiceData.never_sound_like as string[]) ?? null,
    forbidden_register: (voiceData.forbidden_register as string[]) ?? null,
    version: nextVersion,
  }

  if (existing) {
    const { error: updateErr } = await sb
      .from('wv_be_voice_profiles')
      .update(profilePayload)
      .eq('client_id', tenant_id)

    if (updateErr) {
      console.error('[voice/extract] profile update error', { tenant_id, error: updateErr.message })
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  } else {
    const { error: insertErr } = await sb
      .from('wv_be_voice_profiles')
      .insert(profilePayload)

    if (insertErr) {
      console.error('[voice/extract] profile insert error', { tenant_id, error: insertErr.message })
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  return Response.json({ profile: voiceData, version: nextVersion })
}
