// apps/web/src/lib/be-storage.ts
// Brand Engine Slice 5: Supabase Storage helpers (private 'brand-engine' bucket; signed URLs).

import { createClient } from '@supabase/supabase-js'

const BUCKET = 'brand-engine'
const SIGNED_URL_TTL_SECONDS = 3600  // 1 hour, per Q5-9 lock

let _client: ReturnType<typeof createClient> | null = null

function sb() {
  if (_client) return _client
  _client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _client
}

export interface UploadArgs {
  clientId: string
  assetType: string
  fileBytes: ArrayBuffer
  fileName: string  // basename only, no path components
  contentType: string
}

export interface UploadResult {
  storagePath: string
}

function buildStoragePath(clientId: string, assetType: string, fileName: string): string {
  // Sanitize fileName — drop any path separators, keep only basename
  const safeName = fileName.replace(/[/\\]/g, '_').replace(/[^A-Za-z0-9._-]/g, '_')
  return `${clientId}/${assetType}/${Date.now()}-${safeName}`
}

export async function uploadAsset(args: UploadArgs): Promise<UploadResult> {
  const storagePath = buildStoragePath(args.clientId, args.assetType, args.fileName)
  const { error } = await sb()
    .storage.from(BUCKET)
    .upload(storagePath, args.fileBytes, {
      contentType: args.contentType,
      cacheControl: '3600',
      upsert: false,
    })
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }
  return { storagePath }
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await sb()
    .storage.from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)
  if (error || !data?.signedUrl) {
    throw new Error(`Signed URL generation failed: ${error?.message ?? 'no data'}`)
  }
  return data.signedUrl
}

export async function getSignedUrlsBulk(storagePaths: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  // Supabase JS doesn't have a true bulk endpoint; parallelize individual calls
  const results = await Promise.all(
    storagePaths.map(async (path) => {
      try {
        return [path, await getSignedUrl(path)] as const
      } catch {
        return [path, null] as const
      }
    })
  )
  for (const [path, url] of results) {
    if (url) result.set(path, url)
  }
  return result
}

export async function deleteAssetFromStorage(storagePath: string): Promise<void> {
  const { error } = await sb().storage.from(BUCKET).remove([storagePath])
  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`)
  }
}
