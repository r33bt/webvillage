import type { NextRequest } from 'next/server'
import {
  getServiceRoleClient,
  isPublicSlug,
  type ClientRow,
  type VoiceProfileRow,
} from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const NOT_FOUND = new Response('Not found\n', {
  status: 404,
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!isPublicSlug(slug)) return NOT_FOUND

  const sb = getServiceRoleClient()

  const { data: client, error } = await sb
    .from('wv_be_clients')
    .select('id, display_name, industry, metadata, updated_at')
    .eq('metadata->>slug', slug)
    .is('deleted_at', null)
    .maybeSingle<ClientRow>()

  if (error || !client) return NOT_FOUND
  if (client.metadata?.internal_only === true) return NOT_FOUND

  const { data: vp } = await sb
    .from('wv_be_voice_profiles')
    .select(
      'audience, one_word_tone, register, do_list, dont_list, signature_phrases, never_sound_like, forbidden_register, version'
    )
    .eq('client_id', client.id)
    .maybeSingle<VoiceProfileRow>()

  const bf = client.metadata?.brand_facts ?? {}
  const name = bf.name ?? client.display_name

  const lines: string[] = []

  // Title + mission
  lines.push(`# ${name}`)
  if (bf.mission) {
    lines.push('')
    lines.push(`> ${bf.mission}`)
  }

  // About
  lines.push('')
  lines.push('## About')
  if (bf.current_role) {
    lines.push(bf.current_role)
  } else if (bf.founded) {
    lines.push(`Founded: ${bf.founded}`)
  }
  if (bf.industries?.length) {
    lines.push(`Industries: ${bf.industries.join(', ')}`)
  }
  if (bf.geographies?.length) {
    lines.push(`Geographies: ${bf.geographies.join(', ')}`)
  }

  // Key claims
  if (bf.key_claims?.length) {
    lines.push('')
    lines.push('## Key claims')
    for (const claim of bf.key_claims) {
      lines.push(`- ${claim}`)
    }
  }

  // Voice
  if (vp) {
    const voiceParts: string[] = []
    if (vp.one_word_tone) voiceParts.push(`Tone: ${vp.one_word_tone}`)
    if (vp.register) voiceParts.push(`Register: ${vp.register}`)

    lines.push('')
    lines.push('## Voice')
    if (voiceParts.length) lines.push(voiceParts.join(' | '))
    if (vp.audience) lines.push(`Audience: ${vp.audience}`)
  }

  // Career anchors
  if (bf.career_anchors?.length) {
    lines.push('')
    lines.push('## Career anchors')
    for (const anchor of bf.career_anchors) {
      lines.push(`- ${anchor}`)
    }
  }

  // FAQ
  if (bf.faq?.length) {
    lines.push('')
    lines.push('## FAQ')
    for (const qa of bf.faq) {
      lines.push('')
      lines.push(`**Q: ${qa.q}**`)
      lines.push(`A: ${qa.a}`)
    }
  }

  // Links
  if (bf.links && Object.keys(bf.links).length) {
    lines.push('')
    lines.push('## Links')
    for (const [k, v] of Object.entries(bf.links)) {
      lines.push(`- ${k}: ${v}`)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push(`Last updated: ${client.updated_at.slice(0, 10)}`)
  lines.push(`Source: BrandHacker — https://brandhacker.com`)
  lines.push(`Canonical: https://app.brandhacker.com/${slug}/factsheet.md`)
  lines.push('')

  // Crawl log — best-effort
  await sb
    .from('wv_be_aeo_crawl_log')
    .insert({
      client_id: client.id,
      artefact_type: 'llms_txt',
      user_agent: req.headers.get('user-agent') ?? '(none)',
      ip_hash: null,
    })
    .then(() => undefined, () => undefined)

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-BrandHacker-Schema': 'factsheet.md v1',
      'X-BrandHacker-Tenant': slug,
    },
  })
}
