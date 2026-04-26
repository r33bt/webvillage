'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

const REGISTERS = ['casual', 'professional', 'academic', 'plainspoken', 'authoritative', 'warm'] as const
const QUALITY_TIERS = ['standard', 'editorial'] as const

function splitLines(input: string | null | undefined): string[] {
  if (!input) return []
  return input
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function nullableText(v: FormDataEntryValue | null): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  return trimmed.length === 0 ? null : trimmed
}

function nullableNumeric(v: FormDataEntryValue | null): number | null {
  if (typeof v !== 'string' || v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function upsertVoiceProfile(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  if (!clientId) throw new Error('Missing client_id')

  const register = nullableText(formData.get('register'))
  if (register && !REGISTERS.includes(register as (typeof REGISTERS)[number])) {
    throw new Error(`Invalid register: ${register}`)
  }

  const qualityTier = String(formData.get('quality_tier') ?? 'standard')
  if (!QUALITY_TIERS.includes(qualityTier as (typeof QUALITY_TIERS)[number])) {
    throw new Error(`Invalid quality_tier: ${qualityTier}`)
  }

  const intakeMethod = String(formData.get('intake_method') ?? 'questionnaire_only')

  const sb = createSupabaseServiceClient()

  // Fetch existing profile (one row per client). If exists, snapshot to versions then update.
  const { data: existing } = await sb
    .from('wv_be_voice_profiles')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()

  const newVersion = existing ? (existing.version as number) + 1 : 1

  if (existing) {
    await sb.from('wv_be_voice_profile_versions').insert({
      client_id: clientId,
      version: existing.version,
      snapshot: existing,
      reason: 'editor_refinement',
    })
  }

  const payload = {
    client_id: clientId,
    version: newVersion,
    intake_method: intakeMethod,
    source_url: nullableText(formData.get('source_url')),
    audience: nullableText(formData.get('audience')),
    one_word_tone: nullableText(formData.get('one_word_tone')),
    never_sound_like: splitLines(formData.get('never_sound_like') as string | null).slice(0, 5),
    register,
    do_list: splitLines(formData.get('do_list') as string | null),
    dont_list: splitLines(formData.get('dont_list') as string | null),
    reading_grade_target: nullableNumeric(formData.get('reading_grade_target')),
    signature_phrases: splitLines(formData.get('signature_phrases') as string | null),
    forbidden_register: splitLines(formData.get('forbidden_register') as string | null),
    quality_tier: qualityTier,
    last_refined_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = existing
    ? await sb.from('wv_be_voice_profiles').update(payload).eq('client_id', clientId)
    : await sb.from('wv_be_voice_profiles').insert(payload)

  if (error) {
    throw new Error(`Voice profile save failed: ${error.message}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}`)
  revalidatePath(`/admin/brand-engine/${clientId}/voice`)
  redirect(`/admin/brand-engine/${clientId}?saved=v${newVersion}`)
}
