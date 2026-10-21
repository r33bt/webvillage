// Descriptions on unclaimed listings were seeded by the directory, not written by the provider.
// Scheme claims ("claimable under SBL/SBL-Khas", "eligible for levy claims") in that text are not
// ours to make, so they are removed before the text is shown anywhere (page, cards, structured data).

// A sentence that still carries a scheme claim after the inline qualifier is removed is dropped.
// `claima` also catches seeded text that was cut off mid-word ("HRD Corp claima").
const SCHEME_CLAIM =
  /\bclaima|\bSBL\b|\blevy[- ](?:claim|paying)|\bHRD ?Corp claim|\bHCC\b|\bSkim Bantuan Latihan\b/i

// Inline qualifier in front of a noun: "offers HRD Corp / HRDF claimable training" -> "offers training".
// Only when the next word is lower case, so a company name such as "X - HRDF Claimable Training
// Provider" is left whole (and its sentence is dropped instead of being rewritten).
const INLINE_QUALIFIER =
  /(?:\b100% )?(?:\b(?:HRD ?Corp|HRDF|HRDC)(?:\s*\/\s*(?:HRD ?Corp|HRDF|HRDC))*[- ])?\b[Cc]laimable\s+(?=(?:(?:corporate|business|employee|development|soft skills|IT|technical|and)\s+){0,3}(?:training|courses?|programm?es?|programs?|certifications?)\b)/g

// Sentence split: after . ! ? followed by a capital, digit or opening quote/bracket, but not after
// "Sdn." (as in "Sdn. Bhd."), honorifics or e.g./i.e., which would leave a dangling fragment.
const SENTENCE_BREAK = /(?<=[.!?])(?<!\b(?:Sdn|Dr|Mr|Mrs|Ms|No|St|vs|e\.g|i\.e)\.)\s+(?=[A-Z0-9"“‘(])/

/** Description text safe to show publicly: unchanged for claimed profiles, scheme claims removed otherwise. */
export function publicDescription(description: string | null | undefined, claimed: boolean): string | null {
  if (!description) return null
  if (claimed) return description
  const kept = description
    .replace(INLINE_QUALIFIER, '')
    .split(SENTENCE_BREAK)
    .filter((sentence) => !SCHEME_CLAIM.test(sentence))
    .join(' ')
    .trim()
  return kept.length > 0 ? kept : null
}

/**
 * True only when the provider's owner saved the description themselves (dashboard profile edit).
 * A claimed profile can still carry the text the directory seeded, which must not be labelled
 * "From the provider". `description_edited_by_owner` is missing until its migration is applied;
 * missing counts as false.
 */
export function isOwnerWrittenDescription(provider: {
  claimed: boolean
  description_edited_by_owner?: boolean | null
}): boolean {
  return provider.claimed && provider.description_edited_by_owner === true
}
