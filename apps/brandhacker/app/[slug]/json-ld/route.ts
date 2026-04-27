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
    .select('audience, one_word_tone, register')
    .eq('client_id', client.id)
    .maybeSingle<Pick<VoiceProfileRow, 'audience' | 'one_word_tone' | 'register'>>()

  const bf = client.metadata?.brand_facts ?? {}

  // Determine schema type: Person if single founder + current_role is set
  const founders = bf.founders ?? []
  const isPerson = founders.length === 1 && !!bf.current_role

  // Build sameAs array from all link values
  const sameAs = bf.links ? Object.values(bf.links).filter(Boolean) : []

  // Primary URL: prefer website link, then linkedin, then first available
  const links = bf.links ?? {}
  const primaryUrl =
    links.website ??
    links.linkedin ??
    (Object.values(links)[0] as string | undefined) ??
    null

  // knowsAbout: industries + geographies combined
  const knowsAbout = [
    ...(bf.industries ?? []),
    ...(bf.geographies ?? []),
  ]

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isPerson ? 'Person' : 'Organization',
    name: bf.name ?? client.display_name,
    ...(primaryUrl ? { url: primaryUrl } : {}),
    ...(bf.mission ? { description: bf.mission } : {}),
    ...(bf.founded && !isPerson ? { foundingDate: bf.founded } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
  }

  if (isPerson && founders[0]) {
    jsonLd.jobTitle = bf.current_role ?? undefined
    // For Person type, founders[0] is the person's name — already in `name`.
    // Optionally surface the founder name as workedFor if needed; keep it simple for v1.
  } else if (!isPerson && founders.length) {
    jsonLd.founder = founders.map((f: string) => ({
      '@type': 'Person',
      name: f,
    }))
  }

  // Crawl log — best-effort
  await sb
    .from('wv_be_aeo_crawl_log')
    .insert({
      client_id: client.id,
      artefact_type: 'schema_jsonld',
      user_agent: req.headers.get('user-agent') ?? '(none)',
      ip_hash: null,
    })
    .then(() => undefined, () => undefined)

  return new Response(JSON.stringify(jsonLd, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-BrandHacker-Schema': 'json-ld v1',
      'X-BrandHacker-Tenant': slug,
    },
  })
}
