// apps/web/app/api/be/assets/route.ts
// Brand Engine Slice 5:
//   POST = founder upload (multipart/form-data) — logo, palette JSON, mood board, photo, banner, font, style guide PDF
//   GET = list per client, optional asset_type filter, returns signed URLs

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { uploadAsset, getSignedUrlsBulk } from '@/lib/be-storage'

export const runtime = 'nodejs'
export const maxDuration = 30

// Per Q5-7 lock — full asset_type taxonomy from Migration 0005
const VALID_ASSET_TYPES = [
  'logo_primary', 'logo_secondary',
  'palette',
  'font_primary', 'font_secondary',
  'photo_headshot', 'photo_lifestyle',
  'banner_li', 'banner_x', 'banner_fb',
  'mood_board',
  'generated_image',
  'lora_image',
  'style_guide_pdf',
] as const

// Singleton types — only one active row per client (409 if duplicate upload attempted)
const SINGLETON_TYPES = new Set([
  'logo_primary',
  'logo_secondary',
  'palette',
  'font_primary',
  'font_secondary',
  'style_guide_pdf',
])

const MAX_FILE_BYTES = 15 * 1024 * 1024  // 15 MB cap (Q5-3 + spec §1.2)
const MOOD_BOARD_CAP = 12

const MIME_ALLOWLIST: Record<string, string[]> = {
  logo_primary: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  logo_secondary: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  font_primary: ['font/woff2', 'font/woff', 'font/ttf', 'font/otf', 'application/octet-stream'],
  font_secondary: ['font/woff2', 'font/woff', 'font/ttf', 'font/otf', 'application/octet-stream'],
  photo_headshot: ['image/png', 'image/jpeg', 'image/webp'],
  photo_lifestyle: ['image/png', 'image/jpeg', 'image/webp'],
  banner_li: ['image/png', 'image/jpeg', 'image/webp'],
  banner_x: ['image/png', 'image/jpeg', 'image/webp'],
  banner_fb: ['image/png', 'image/jpeg', 'image/webp'],
  mood_board: ['image/png', 'image/jpeg', 'image/webp'],
  lora_image: ['image/png', 'image/jpeg'],
  style_guide_pdf: ['application/pdf'],
  // palette: no file expected (metadata-only)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const clientId = String(formData.get('client_id') ?? '')
  const assetType = String(formData.get('asset_type') ?? '')
  const metadataStr = formData.get('metadata') as string | null
  const fileBlob = formData.get('file') as File | null

  if (!clientId || !z.string().uuid().safeParse(clientId).success) {
    return NextResponse.json({ error: 'invalid_client_id' }, { status: 400 })
  }
  if (!VALID_ASSET_TYPES.includes(assetType as (typeof VALID_ASSET_TYPES)[number])) {
    return NextResponse.json({ error: 'invalid_asset_type', valid: VALID_ASSET_TYPES }, { status: 400 })
  }

  // Parse metadata JSON if provided
  let metadata: Record<string, unknown> = {}
  if (metadataStr) {
    try {
      metadata = JSON.parse(metadataStr)
    } catch {
      return NextResponse.json({ error: 'invalid_metadata_json' }, { status: 400 })
    }
  }

  const sb = createSupabaseServiceClient()

  // Verify client
  const { data: client } = await sb.from('wv_be_clients').select('id').eq('id', clientId).is('deleted_at', null).single()
  if (!client) {
    return NextResponse.json({ error: 'client_not_found' }, { status: 404 })
  }

  // Singleton check
  if (SINGLETON_TYPES.has(assetType)) {
    const { count } = await sb
      .from('wv_be_brand_assets')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('asset_type', assetType)
      .is('deleted_at', null)
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: 'asset_type_already_exists', asset_type: assetType }, { status: 409 })
    }
  }

  // Mood-board cap check
  if (assetType === 'mood_board') {
    const { count } = await sb
      .from('wv_be_brand_assets')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('asset_type', 'mood_board')
      .is('deleted_at', null)
    if ((count ?? 0) >= MOOD_BOARD_CAP) {
      return NextResponse.json({ error: 'mood_board_full', existing_count: count }, { status: 409 })
    }
  }

  let storagePath: string | null = null
  let fileSize: number | null = null
  let mimeType: string | null = null

  if (assetType === 'palette') {
    // Palette is metadata-only; no file required
    if (!metadata || (Array.isArray(metadata) && metadata.length === 0) || Object.keys(metadata).length === 0) {
      return NextResponse.json(
        { error: 'palette_metadata_required', detail: 'Palette uploads require metadata JSON with tokens or hex_* keys' },
        { status: 400 }
      )
    }
  } else {
    // All other types require a file
    if (!fileBlob) {
      return NextResponse.json({ error: 'file_required', asset_type: assetType }, { status: 400 })
    }
    if (fileBlob.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'file_too_large', size_bytes: fileBlob.size, cap_bytes: MAX_FILE_BYTES },
        { status: 413 }
      )
    }
    const contentType = fileBlob.type || 'application/octet-stream'
    const allowed = MIME_ALLOWLIST[assetType] ?? []
    if (!allowed.includes(contentType)) {
      return NextResponse.json(
        { error: 'mime_not_allowed', mime: contentType, allowed },
        { status: 415 }
      )
    }

    try {
      const upload = await uploadAsset({
        clientId,
        assetType,
        fileBytes: await fileBlob.arrayBuffer(),
        fileName: fileBlob.name || `upload-${Date.now()}`,
        contentType,
      })
      storagePath = upload.storagePath
      fileSize = fileBlob.size
      mimeType = contentType
    } catch (err) {
      return NextResponse.json(
        { error: 'storage_upload_failed', detail: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      )
    }
  }

  // Persist
  const { data: assetRow, error: insertErr } = await sb
    .from('wv_be_brand_assets')
    .insert({
      client_id: clientId,
      asset_type: assetType,
      storage_path: storagePath,
      file_size_bytes: fileSize,
      mime_type: mimeType,
      metadata,
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
    client_id: clientId,
    actor_user_id: null,
    actor_type: 'founder',
    action: 'asset_upload',
    target_table: 'wv_be_brand_assets',
    target_id: assetRow.id,
    after_state: {
      asset_type: assetType,
      storage_path: storagePath,
      file_size_bytes: fileSize,
      mime_type: mimeType,
      metadata_keys: Object.keys(metadata),
    },
  })

  return NextResponse.json({
    asset_id: assetRow.id,
    asset_type: assetType,
    storage_path: storagePath,
    file_size_bytes: fileSize,
    mime_type: mimeType,
  })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const clientId = url.searchParams.get('client_id')
  const assetTypeFilter = url.searchParams.get('asset_type')

  if (!clientId || !z.string().uuid().safeParse(clientId).success) {
    return NextResponse.json({ error: 'invalid_client_id' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()
  let q = sb
    .from('wv_be_brand_assets')
    .select('id, client_id, asset_type, storage_path, file_size_bytes, mime_type, metadata, generated_for_draft_id, created_at')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (assetTypeFilter) {
    q = q.eq('asset_type', assetTypeFilter)
  }

  const { data: assets, error } = await q
  if (error) {
    return NextResponse.json({ error: 'fetch_failed', detail: error.message }, { status: 500 })
  }

  // Generate signed URLs in bulk for any asset with a storage path
  const pathsToSign = (assets ?? []).filter((a) => a.storage_path).map((a) => a.storage_path as string)
  const urlMap = await getSignedUrlsBulk(pathsToSign)

  return NextResponse.json({
    assets: (assets ?? []).map((a) => ({
      ...a,
      signed_url: a.storage_path ? urlMap.get(a.storage_path) ?? null : null,
    })),
  })
}
