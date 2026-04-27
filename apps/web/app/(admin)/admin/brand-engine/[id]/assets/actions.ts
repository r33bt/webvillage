'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { deleteAssetFromStorage } from '@/lib/be-storage'

async function baseUrl(): Promise<string> {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  return `${proto}://${host}`
}

export async function uploadAsset(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  if (!clientId) throw new Error('Missing client_id')

  // Pass formData through directly (server actions can forward FormData to fetch)
  const url = `${await baseUrl()}/api/be/assets`
  const resp = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/assets?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/assets`)
  revalidatePath(`/admin/brand-engine/${clientId}`)
  redirect(`/admin/brand-engine/${clientId}/assets`)
}

export async function generateImage(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const prompt = String(formData.get('prompt') ?? '').trim()
  const assetType = String(formData.get('asset_type') ?? 'generated_image')
  const aspectRatio = String(formData.get('aspect_ratio') ?? '1x1')
  const renderingSpeed = String(formData.get('rendering_speed') ?? 'TURBO')

  if (!clientId) throw new Error('Missing client_id')
  if (prompt.length < 5) throw new Error('Prompt too short')

  const resp = await fetch(`${await baseUrl()}/api/be/visual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      prompt,
      asset_type: assetType,
      aspect_ratio: aspectRatio,
      rendering_speed: renderingSpeed,
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/assets?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/assets`)
  redirect(`/admin/brand-engine/${clientId}/assets`)
}

export async function softDeleteAsset(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const assetId = String(formData.get('asset_id') ?? '')
  if (!clientId || !assetId) throw new Error('Missing client_id or asset_id')

  const sb = createSupabaseServiceClient()
  const { data: existing } = await sb
    .from('wv_be_brand_assets')
    .select('id, storage_path')
    .eq('id', assetId)
    .eq('client_id', clientId)
    .single()
  if (!existing) throw new Error('Asset not found')

  // Soft-delete first (set deleted_at)
  const { error } = await sb.from('wv_be_brand_assets').update({ deleted_at: new Date().toISOString() }).eq('id', assetId)
  if (error) throw new Error(`Soft delete failed: ${error.message}`)

  // Best-effort hard-delete from Storage (storage_path may be null for palette-only rows)
  if (existing.storage_path) {
    try {
      await deleteAssetFromStorage(existing.storage_path as string)
    } catch (err) {
      console.warn('[assets] storage delete failed (soft delete still applied):', err)
    }
  }

  await sb.from('wv_be_audit_log').insert({
    client_id: clientId,
    actor_user_id: null,
    actor_type: 'founder',
    action: 'asset_soft_delete',
    target_table: 'wv_be_brand_assets',
    target_id: assetId,
  })

  revalidatePath(`/admin/brand-engine/${clientId}/assets`)
  revalidatePath(`/admin/brand-engine/${clientId}`)
}
