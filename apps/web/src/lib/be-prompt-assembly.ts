// apps/web/src/lib/be-prompt-assembly.ts
// Brand Engine prompt assembly: substitute {voice.*}, {brand_name}, {prompt}, {banned_phrases_canon_list},
// and per-template extra vars into the template body_template.

interface VoiceProfile {
  audience: string | null
  one_word_tone: string | null
  register: string | null
  do_list: string[] | null
  dont_list: string[] | null
  never_sound_like: string[] | null
  signature_phrases: string[] | null
  reading_grade_target: number | null
  forbidden_register: string[] | null
  quality_tier: string
}

interface BannedPhrase {
  phrase: string
  category: string | null
  severity: 'block' | 'flag'
  rationale: string | null
}

interface AssembleArgs {
  templateBody: string
  brandName: string
  voiceProfile: VoiceProfile
  prompt: string
  bannedPhrases: BannedPhrase[]
  vars?: Record<string, string>
}

function bulletList(items: string[] | null | undefined): string {
  if (!items || items.length === 0) return '(none)'
  return items.map((s) => `- ${s}`).join('\n')
}

function commaList(items: string[] | null | undefined): string {
  if (!items || items.length === 0) return '(none)'
  return items.join(', ')
}

function bannedList(rows: BannedPhrase[]): string {
  if (rows.length === 0) return '(no banned phrases)'
  // Sort: block severity first, then alphabetical
  const sorted = [...rows].sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'block' ? -1 : 1
    return a.phrase.localeCompare(b.phrase)
  })
  return sorted.map((r) => `- "${r.phrase}" (${r.severity}, ${r.category ?? 'uncategorized'})`).join('\n')
}

export function assemblePrompt(args: AssembleArgs): string {
  const { templateBody, brandName, voiceProfile, prompt, bannedPhrases, vars = {} } = args

  const substitutions: Record<string, string> = {
    'brand_name': brandName,
    'prompt': prompt,
    'banned_phrases_canon_list': bannedList(bannedPhrases),
    'voice.audience': voiceProfile.audience ?? '(not set)',
    'voice.one_word_tone': voiceProfile.one_word_tone ?? '(not set)',
    'voice.register': voiceProfile.register ?? '(not set)',
    'voice.do_list': bulletList(voiceProfile.do_list),
    'voice.dont_list': bulletList(voiceProfile.dont_list),
    'voice.never_sound_like': commaList(voiceProfile.never_sound_like),
    'voice.signature_phrases': bulletList(voiceProfile.signature_phrases),
    'voice.reading_grade_target': voiceProfile.reading_grade_target?.toString() ?? '8',
    'voice.forbidden_register': commaList(voiceProfile.forbidden_register),
    ...vars,
  }

  // Replace {placeholder} occurrences. Simple substring replace; not a regex/Mustache parser.
  let assembled = templateBody
  for (const [key, value] of Object.entries(substitutions)) {
    const placeholder = `{${key}}`
    assembled = assembled.split(placeholder).join(value)
  }

  return assembled
}
