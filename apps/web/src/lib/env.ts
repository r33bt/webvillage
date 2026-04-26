// apps/web/src/lib/env.ts
// Typed accessors for env vars used by webvillage.com.

/**
 * Cal.com booking URL for the WebVillage Discovery Call event.
 * Returns null until NEXT_PUBLIC_CAL_URL is configured — callers should
 * fall back to the /api/contact form when this is absent.
 */
export function getCalUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_CAL_URL?.trim()
  return url ? url : null
}
