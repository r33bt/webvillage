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

  // Defense-in-depth gate #1: env var allowlist
  if (!isPublicSlug(slug)) return NOT_FOUND

  const sb = getServiceRoleClient()

  const { data: client, error } = await sb
    .from('wv_be_clients')
    .select('id, display_name, industry, metadata, updated_at')
    .eq('metadata->>slug', slug)
    .is('deleted_at', null)
    .maybeSingle<ClientRow>()

  if (error || !client) return NOT_FOUND

  // Defense-in-depth gate #2: per-tenant internal_only flag
  if (client.metadata?.internal_only === true) return NOT_FOUND

  const { data: vp } = await sb
    .from('wv_be_voice_profiles')
    .select(
      'audience, one_word_tone, register, do_list, dont_list, signature_phrases, never_sound_like, forbidden_register, version'
    )
    .eq('client_id', client.id)
    .maybeSingle<VoiceProfileRow>()

  const bf = client.metadata?.brand_facts ?? {}
  const lines: string[] = []

  lines.push(`# ${bf.name ?? client.display_name}`)
  lines.push('')
  if (bf.mission) {
    lines.push(`> ${bf.mission}`)
    lines.push('')
  }

  lines.push('## Brand facts')
  if (bf.founded) lines.push(`- Founded: ${bf.founded}`)
  if (bf.current_role) lines.push(`- Current role: ${bf.current_role}`)
  if (bf.industries?.length) lines.push(`- Industries: ${bf.industries.join(', ')}`)
  if (bf.geographies?.length) lines.push(`- Geographies: ${bf.geographies.join(', ')}`)

  if (bf.key_claims?.length) {
    lines.push('')
    lines.push('## Key claims')
    for (const c of bf.key_claims) lines.push(`- ${c}`)
  }

  if (bf.career_anchors?.length) {
    lines.push('')
    lines.push('## Career anchors')
    for (const c of bf.career_anchors) lines.push(`- ${c}`)
  }

  if (bf.primary_outputs?.length) {
    lines.push('')
    lines.push('## Primary outputs')
    for (const p of bf.primary_outputs) lines.push(`- ${p}`)
  }

  if (vp) {
    lines.push('')
    lines.push('## Voice')
    if (vp.audience) lines.push(`- Audience: ${vp.audience}`)
    if (vp.one_word_tone) lines.push(`- Tone: ${vp.one_word_tone}`)
    if (vp.register) lines.push(`- Register: ${vp.register}`)
    if (vp.signature_phrases?.length) {
      lines.push('')
      lines.push('### Signature phrases')
      for (const p of vp.signature_phrases) lines.push(`- "${p}"`)
    }
    if (vp.never_sound_like?.length) {
      lines.push('')
      lines.push('### Voice anti-patterns (never sound like)')
      for (const n of vp.never_sound_like) lines.push(`- ${n}`)
    }
  }

  if (bf.faq?.length) {
    lines.push('')
    lines.push('## FAQ')
    for (const qa of bf.faq) {
      lines.push('')
      lines.push(`**Q: ${qa.q}**`)
      lines.push('')
      lines.push(`A: ${qa.a}`)
    }
  }

  if (bf.links && Object.keys(bf.links).length) {
    lines.push('')
    lines.push('## Links')
    for (const [k, v] of Object.entries(bf.links)) lines.push(`- ${k}: ${v}`)
  }

  lines.push('')
  lines.push('---')
  lines.push(`Last updated: ${client.updated_at.slice(0, 10)}`)
  lines.push(`Source: BrandHacker — https://brandhacker.com`)
  lines.push(`Canonical: https://app.brandhacker.com/${slug}/llms.txt`)
  lines.push('')

  // Crawl log — best-effort, don't block response on failure
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
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-BrandHacker-Schema': 'llms.txt v1',
      'X-BrandHacker-Tenant': slug,
    },
  })
}
