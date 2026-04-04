// apps/web/src/lib/api-auth.ts
// API key authentication for WebVillage Mode 3 REST API
//
// Keys are stored as SHA-256 hashes — the raw key is shown once at creation.
// Format: wvk_<32 random chars>
//
// Usage in a Route Handler:
//   const auth = await verifyApiKey(request, directorySlug)
//   if (!auth.ok) return auth.error
//   // auth.directoryId is now trusted

import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from './supabase'

export interface ApiKeyAuthResult {
  ok: true
  directoryId: string
  scopes: string[]
  keyId: string
}

export interface ApiKeyAuthError {
  ok: false
  error: NextResponse
}

export type ApiKeyAuth = ApiKeyAuthResult | ApiKeyAuthError

/**
 * Verifies the Bearer API key in the Authorization header.
 * Optionally enforces that the key belongs to a specific directory slug.
 */
export async function verifyApiKey(
  request: Request,
  requiredDirectorySlug?: string,
  requiredScope: 'read' | 'write' | 'admin' = 'read'
): Promise<ApiKeyAuth> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: 'Missing or malformed Authorization header. Use: Authorization: Bearer wvk_...' },
        { status: 401 }
      ),
    }
  }

  const rawKey = authHeader.slice(7).trim()
  if (!rawKey.startsWith('wvk_') || rawKey.length < 20) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 }
      ),
    }
  }

  const keyHash = hashApiKey(rawKey)
  const supabase = createSupabaseServiceClient()

  const { data: keyRow, error } = await supabase
    .from('wv_api_keys')
    .select('id, directory_id, scopes, revoked_at')
    .eq('key_hash', keyHash)
    .single()

  if (error || !keyRow) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }),
    }
  }

  if (keyRow.revoked_at) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'API key has been revoked' }, { status: 401 }),
    }
  }

  // Check scope
  const scopes: string[] = keyRow.scopes ?? ['read']
  const scopeLevel = { read: 1, write: 2, admin: 3 }
  const keyLevel = Math.max(...scopes.map((s) => scopeLevel[s as keyof typeof scopeLevel] ?? 0))
  const requiredLevel = scopeLevel[requiredScope]
  if (keyLevel < requiredLevel) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: `This key requires '${requiredScope}' scope` },
        { status: 403 }
      ),
    }
  }

  // If a directory slug is required, verify the key belongs to that directory
  if (requiredDirectorySlug) {
    const { data: dir } = await supabase
      .from('wv_directories')
      .select('id')
      .eq('id', keyRow.directory_id)
      .eq('slug', requiredDirectorySlug)
      .single()

    if (!dir) {
      return {
        ok: false,
        error: NextResponse.json(
          { error: 'API key is not authorised for this directory' },
          { status: 403 }
        ),
      }
    }
  }

  // Update last_used_at (fire-and-forget — don't await)
  supabase
    .from('wv_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyRow.id)
    .then(() => {})

  return {
    ok: true,
    directoryId: keyRow.directory_id,
    scopes,
    keyId: keyRow.id,
  }
}

/**
 * Generates a new API key and returns both the raw key (shown once)
 * and the hash (stored in DB).
 */
export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const rand = randomBytes(24).toString('hex') // 48 hex chars
  const raw = `wvk_${rand}`
  const hash = hashApiKey(raw)
  const prefix = raw.slice(0, 12) // 'wvk_' + 8 chars
  return { raw, hash, prefix }
}

function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

/**
 * JSON error helper
 */
export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}
