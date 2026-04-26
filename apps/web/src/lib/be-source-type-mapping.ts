// apps/web/src/lib/be-source-type-mapping.ts
// Maps wv_be_templates.template_type + voice_profile.quality_tier → wv_be_drafts.source_type.
// Per Slice 3 spec §8.

type TemplateType =
  | 'post'
  | 'long_form_article'
  | 'outreach_opener'
  | 'outreach_followup'
  | 'connection_request'
  | 'cluster'
  | 'profile_bio'
  | 'featured_tile'
  | 'banner'
  | 'email'

type QualityTier = 'standard' | 'editorial'

type SourceType =
  | 'tool_post'
  | 'tool_article'
  | 'tool_bio'
  | 'tool_featured_tile'
  | 'outreach_message'
  | 'editorial_post'
  | 'editorial_article'
  | 'editorial_email'

export function deriveSourceType(templateType: TemplateType, qualityTier: QualityTier): SourceType {
  switch (templateType) {
    case 'post':
      return qualityTier === 'editorial' ? 'editorial_post' : 'tool_post'
    case 'long_form_article':
      return qualityTier === 'editorial' ? 'editorial_article' : 'tool_article'
    case 'outreach_opener':
    case 'outreach_followup':
    case 'connection_request':
      return 'outreach_message'
    case 'profile_bio':
      return 'tool_bio'
    case 'featured_tile':
      return 'tool_featured_tile'
    case 'email':
      return 'editorial_email'
    case 'cluster':
      throw new Error(
        'Slice 3: cluster templates not directly draftable — cluster expansion (Slice 6) generates child drafts with per-child source_type derivation'
      )
    case 'banner':
      throw new Error('Slice 3: banner template_type has no source_type mapping; needs schema enum extension when used')
    default: {
      const _exhaustive: never = templateType
      throw new Error(`Unknown template_type: ${_exhaustive}`)
    }
  }
}
