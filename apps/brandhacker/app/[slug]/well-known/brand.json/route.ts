import type { NextRequest } from 'next/server'
import {
  getServiceRoleClient,
  isPublicSlug,
  type ClientRow,
  type VoiceProfileRow,
} from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const notFound = () =>
  Response.json({ error: 'not_found' }, { status: 404 })

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!isPublicSlug(slug)) return notFound()

  const sb = getServiceRoleClient()

  const { data: client, error } = await sb
    .from('wv_be_clients')
    .select('id, display_name, industry, metadata, updated_at')
    .eq('metadata->>slug', slug)
    .is('deleted_at', null)
    .maybeSingle<ClientRow>()

  if (error || !client) return notFound()
  if (client.metadata?.internal_only === true) return notFound()

  const { data: vp } = await sb
    .from('wv_be_voice_profiles')
    .select(
      'audience, one_word_tone, register, do_list, dont_list, signature_phrases, never_sound_like, forbidden_register, version'
    )
    .eq('client_id', client.id)
    .maybeSingle<VoiceProfileRow>()

  const bf = client.metadata?.brand_facts ?? {}

  const out = {
    schema_version: 'v1',
    schema_url: 'https://brandhacker.com/schemas/brand.json/v1',
    canonical_url: `https://app.brandhacker.com/${slug}/.well-known/brand.json`,
    last_updated: client.updated_at,
    source_authority_url: 'https://brandhacker.com',
    brand: {
      name: bf.name ?? client.display_name,
      display_name: client.display_name,
      founded: bf.founded ?? null,
      mission: bf.mission ?? null,
      primary_outputs: bf.primary_outputs ?? [],
      geographies: bf.geographies ?? [],
      industries: bf.industries ?? [],
      key_claims: bf.key_claims ?? [],
      ...(bf.career_anchors ? { career_anchors: bf.career_anchors } : {}),
      ...(bf.current_role ? { current_role: bf.current_role } : {}),
      ...(bf.links ? { links: bf.links } : {}),
    },
    voice: vp
      ? {
          audience: vp.audience,
          tone: vp.one_word_tone,
          register: vp.register,
          version: vp.version,
          signature_phrases: vp.signature_phrases ?? [],
          never_sound_like: vp.never_sound_like ?? [],
        }
      : null,
    guidelines: vp
      ? {
          do: vp.do_list ?? [],
          dont: vp.dont_list ?? [],
          forbidden_register: vp.forbidden_register ?? [],
        }
      : null,
    faq: bf.faq ?? [],
  }

  await sb
    .from('wv_be_aeo_crawl_log')
    .insert({
      client_id: client.id,
      artefact_type: 'brand_json',
      user_agent: req.headers.get('user-agent') ?? '(none)',
      ip_hash: null,
    })
    .then(() => undefined, () => undefined)

  return Response.json(out, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-BrandHacker-Schema': 'brand.json v1',
      'X-BrandHacker-Tenant': slug,
    },
  })
}
