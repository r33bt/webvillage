// apps/web/app/api/be/visual/route.ts
// Brand Engine Slice 5: per-brand visual style-aware image generation via Ideogram v3
// Spec: 78-webvillage/docs/slice-5-visual-substrate-spec-v1.md

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { generateImage, fetchImageBytes, IdeogramAPIError, type AspectRatio, type RenderingSpeed } from '@/lib/ideogram'
import { computeCostCents } from '@/lib/ideogram-pricing'
import { assembleVisualPrompt } from '@/lib/be-visual-prompt-assembly'
import { uploadAsset, getSignedUrl, getSignedUrlsBulk } from '@/lib/be-storage'

export const runtime = 'nodejs'
export const maxDuration = 60

// Q5-5 lock: hard cap 50 generated_image rows per client per 24h
const DAILY_GEN_CAP = 50

const RequestSchema = z.object({
  client_id: z.string().uuid(),
  prompt: z.string().min(5).max(2000),
  asset_type: z.enum(['generated_image', 'banner_li', 'banner_x', 'banner_fb', 'photo_lifestyle']).default('generated_image'),
  aspect_ratio: z.enum(['1x1', '16x9', '9x16', '4x3', '3x4', '3x2', '2x3', '5x4', '4x5', '16x10', '10x16']).default('1x1'),
  rendering_speed: z.enum(['TURBO', 'DEFAULT', 'QUALITY']).default('TURBO'),
  reference_asset_id: z.string().uuid().optional(),
  draft_id: z.string().uuid().optional(),
})

interface BrandAsset {
  id: string
  client_id: string
  asset_type: string
  storage_path: string | null
  metadata: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RequestSchema>
  try {
    const json = await req.json()
    body = RequestSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()

  // Fetch client + all brand assets in one round-trip
  const [{ data: client, error: clientErr }, { data: assets }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', body.client_id).is('deleted_at', null).single(),
    sb
      .from('wv_be_brand_assets')
      .select('id, client_id, asset_type, storage_path, metadata')
      .eq('client_id', body.client_id)
      .is('deleted_at', null),
  ])

  if (clientErr || !client) {
    return NextResponse.json({ error: 'client_not_found' }, { status: 404 })
  }

  const brandAssets = (assets ?? []) as BrandAsset[]

  // Daily-cap enforcement (Q5-5)
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  const { count: recentGenCount } = await sb
    .from('wv_be_brand_assets')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', body.client_id)
    .eq('asset_type', 'generated_image')
    .is('deleted_at', null)
    .gte('created_at', since)
  if ((recentGenCount ?? 0) >= DAILY_GEN_CAP) {
    return NextResponse.json(
      { error: 'daily_cap_exceeded', detail: `${DAILY_GEN_CAP} generated_image rows in last 24h` },
      { status: 429 }
    )
  }

  // Bucket assets by type
  const paletteAsset = brandAssets.find((a) => a.asset_type === 'palette')
  const logoAsset = brandAssets.find((a) => a.asset_type === 'logo_primary')
  const fontAsset = brandAssets.find((a) => a.asset_type === 'font_primary')
  const moodBoardAssets = brandAssets
    .filter((a) => a.asset_type === 'mood_board')
    .sort((a, b) => (b.id > a.id ? 1 : -1))
    .slice(0, 3)

  // If reference_asset_id supplied, prepend it to mood board
  let referenceAsset: BrandAsset | undefined
  if (body.reference_asset_id) {
    referenceAsset = brandAssets.find((a) => a.id === body.reference_asset_id)
    if (referenceAsset && referenceAsset.storage_path) {
      moodBoardAssets.unshift(referenceAsset)
    }
  }

  // Pre-fetch signed URLs for assets that have storage paths (for style references)
  const refAssets = [...(logoAsset && logoAsset.storage_path ? [logoAsset] : []), ...moodBoardAssets].filter(
    (a) => a.storage_path
  )
  const signedUrlMap = new Map<string, string>()
  if (refAssets.length > 0) {
    const urlMap = await getSignedUrlsBulk(refAssets.map((a) => a.storage_path!))
    for (const a of refAssets) {
      const url = urlMap.get(a.storage_path!)
      if (url) signedUrlMap.set(a.id, url)
    }
  }

  // Assemble prompt
  const assembled = assembleVisualPrompt(
    {
      founderPrompt: body.prompt,
      brandName: client.display_name,
      assetType: body.asset_type,
      paletteAsset,
      logoAsset,
      moodBoardAssets,
      fontAsset,
    },
    signedUrlMap
  )

  // Call Ideogram
  const t0 = Date.now()
  let ideogramResp
  try {
    ideogramResp = await generateImage({
      prompt: assembled.finalPrompt,
      aspect_ratio: body.aspect_ratio as AspectRatio,
      rendering_speed: body.rendering_speed as RenderingSpeed,
      style_reference_images: assembled.styleReferenceUrls.length > 0 ? assembled.styleReferenceUrls : undefined,
    })
  } catch (err) {
    if (err instanceof IdeogramAPIError) {
      // Per Q5-8: surface raw provider error (safety/policy rejections + credit issues)
      return NextResponse.json(
        { error: err.status === 422 ? 'provider_rejected' : 'provider_error', detail: err.detail },
        { status: err.status >= 400 && err.status < 500 ? 422 : 500 }
      )
    }
    return NextResponse.json(
      { error: 'generation_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
  const latencyMs = Date.now() - t0

  const firstImage = ideogramResp.data[0]
  if (!firstImage) {
    return NextResponse.json({ error: 'no_image_returned' }, { status: 500 })
  }

  // Download generated image bytes from Ideogram's temp URL + upload to our Storage
  let bytes: ArrayBuffer
  let contentType: string
  try {
    const fetched = await fetchImageBytes(firstImage.url)
    bytes = fetched.bytes
    contentType = fetched.contentType
  } catch (err) {
    return NextResponse.json(
      { error: 'image_fetch_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  let storagePath: string
  try {
    const ext = contentType.includes('png') ? 'png' : contentType.includes('jpeg') ? 'jpg' : 'webp'
    const upload = await uploadAsset({
      clientId: body.client_id,
      assetType: 'generated_image',
      fileBytes: bytes,
      fileName: `gen-${firstImage.seed}.${ext}`,
      contentType,
    })
    storagePath = upload.storagePath
  } catch (err) {
    return NextResponse.json(
      { error: 'storage_upload_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  // Persist asset row
  const costCents = computeCostCents(body.rendering_speed as RenderingSpeed, 1)
  const generationMeta = {
    provider: 'ideogram',
    model: `ideogram-v3-${body.rendering_speed.toLowerCase()}`,
    cost_cents: costCents,
    latency_ms: latencyMs,
    seed: firstImage.seed,
    style_reference_used: assembled.styleReferenceUrls.length > 0,
    is_image_safe: firstImage.is_image_safe,
    resolution: firstImage.resolution,
    final_prompt: assembled.finalPrompt,
    palette_mentioned: assembled.paletteMentioned,
    aspect_ratio: body.aspect_ratio,
    rendering_speed: body.rendering_speed,
  }

  const { data: assetRow, error: insertErr } = await sb
    .from('wv_be_brand_assets')
    .insert({
      client_id: body.client_id,
      asset_type: 'generated_image',
      storage_path: storagePath,
      file_size_bytes: bytes.byteLength,
      mime_type: contentType,
      metadata: generationMeta,
      generated_for_draft_id: body.draft_id ?? null,
    })
    .select('id')
    .single()

  if (insertErr || !assetRow) {
    return NextResponse.json(
      { error: 'asset_persist_failed', detail: insertErr?.message ?? 'unknown' },
      { status: 500 }
    )
  }

  // Audit log
  await sb.from('wv_be_audit_log').insert({
    client_id: body.client_id,
    actor_user_id: null,
    actor_type: 'system',
    action: 'visual_generation',
    target_table: 'wv_be_brand_assets',
    target_id: assetRow.id,
    after_state: generationMeta,
  })

  // Generate signed URL for immediate display
  const signedUrl = await getSignedUrl(storagePath)
  const [w, h] = (firstImage.resolution.split('x').map((n) => parseInt(n, 10)) as [number, number]) ?? [1024, 1024]

  return NextResponse.json({
    asset_id: assetRow.id,
    storage_path: storagePath,
    signed_url: signedUrl,
    signed_url_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    width: w,
    height: h,
    generation: generationMeta,
  })
}
