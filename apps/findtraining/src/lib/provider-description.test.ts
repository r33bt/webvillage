import { describe, expect, it } from 'vitest'
import { isOwnerWrittenDescription, publicDescription } from './provider-description'

describe('publicDescription', () => {
  it('returns null for empty input', () => {
    expect(publicDescription(null, false)).toBeNull()
    expect(publicDescription(undefined, false)).toBeNull()
    expect(publicDescription('', false)).toBeNull()
  })

  it('does not split a sentence at "Sdn. Bhd." when dropping a claim sentence', () => {
    const text = 'We are ABC Sdn. Bhd., an SBL-registered provider. We run leadership courses.'
    // A split after "Sdn." would keep the fragment "We are ABC Sdn."
    expect(publicDescription(text, false)).toBe('We run leadership courses.')
  })

  it('does not split a sentence at "e.g." when dropping a claim sentence', () => {
    const text = 'We cover office tools, e.g. Excel, under SBL-Khas. Contact us for dates.'
    expect(publicDescription(text, false)).toBe('Contact us for dates.')
  })

  it('keeps a claim-free sentence that contains "Sdn. Bhd." whole', () => {
    const text = 'XYZ Training Sdn. Bhd. is based in Penang. All courses are HRDF claimable.'
    expect(publicDescription(text, false)).toBe('XYZ Training Sdn. Bhd. is based in Penang.')
  })

  it('strips an inline qualifier in front of a noun and keeps the sentence', () => {
    expect(publicDescription('We offer HRD Corp claimable training in Kuala Lumpur.', false)).toBe(
      'We offer training in Kuala Lumpur.',
    )
    expect(publicDescription('Acme runs 100% HRDF claimable soft skills courses.', false)).toBe(
      'Acme runs soft skills courses.',
    )
    expect(publicDescription('We deliver HRD Corp / HRDF claimable programmes nationwide.', false)).toBe(
      'We deliver programmes nationwide.',
    )
  })

  it('drops a sentence whose claim is part of a company name rather than rewriting it', () => {
    const text = 'Acme - HRDF Claimable Training Provider is based in Penang. We run IT courses.'
    expect(publicDescription(text, false)).toBe('We run IT courses.')
  })

  it('drops a sentence with the truncated "HRD Corp claima"', () => {
    const text = 'Leadership workshops for managers. Courses are HRD Corp claima'
    expect(publicDescription(text, false)).toBe('Leadership workshops for managers.')
  })

  it('returns null when every sentence is a scheme claim', () => {
    expect(publicDescription('All courses are HRDF claimable.', false)).toBeNull()
    expect(publicDescription('Eligible for levy claims. Registered under SBL.', false)).toBeNull()
  })

  it('leaves text without scheme claims unchanged', () => {
    const text = 'We train supervisors. Dr. Lee leads every session.'
    expect(publicDescription(text, false)).toBe(text)
  })

  it('passes an owner-written description through unchanged', () => {
    const text = 'We are HRD Corp claimable. SBL-Khas eligible. HRDF claimable training.'
    expect(publicDescription(text, true)).toBe(text)
  })

  it('cleans a claimed profile whose description is still the seeded text', () => {
    const text = 'We run leadership courses. All courses are HRDF claimable.'
    const claimedUnedited = { claimed: true, description_edited_by_owner: false }
    expect(publicDescription(text, isOwnerWrittenDescription(claimedUnedited))).toBe('We run leadership courses.')
  })

  it('cleans a claimed profile when the flag column is missing (migration not applied)', () => {
    const text = 'We offer HRD Corp claimable training in Kuala Lumpur. Eligible for levy claims.'
    expect(publicDescription(text, isOwnerWrittenDescription({ claimed: true }))).toBe(
      'We offer training in Kuala Lumpur.',
    )
  })

  it('passes the text through only for a claimed profile whose owner saved it', () => {
    const text = 'All courses are HRDF claimable.'
    expect(publicDescription(text, isOwnerWrittenDescription({ claimed: true, description_edited_by_owner: true }))).toBe(text)
    // Flag set on an unclaimed row (should not happen) still does not bypass cleaning.
    expect(publicDescription(text, isOwnerWrittenDescription({ claimed: false, description_edited_by_owner: true }))).toBeNull()
  })
})

describe('isOwnerWrittenDescription', () => {
  it('is true only for a claimed profile whose owner saved the description', () => {
    expect(isOwnerWrittenDescription({ claimed: true, description_edited_by_owner: true })).toBe(true)
    expect(isOwnerWrittenDescription({ claimed: true, description_edited_by_owner: false })).toBe(false)
    expect(isOwnerWrittenDescription({ claimed: false, description_edited_by_owner: true })).toBe(false)
  })

  it('treats a missing column (migration not applied) as false', () => {
    expect(isOwnerWrittenDescription({ claimed: true })).toBe(false)
    expect(isOwnerWrittenDescription({ claimed: true, description_edited_by_owner: null })).toBe(false)
  })
})
