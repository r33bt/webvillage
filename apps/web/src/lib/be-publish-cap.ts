// apps/web/src/lib/be-publish-cap.ts
// Slice 8 Q8-7: per-brand publish-volume cap. 50/day soft warning + 100/day hard cap, sliding 24h window.
// Override per-brand via wv_be_clients.metadata.publish_cap_hard / .publish_cap_soft (future).

import { createSupabaseServiceClient } from './supabase'

const DEFAULT_SOFT_CAP = 50
const DEFAULT_HARD_CAP = 100

export interface CapCheckResult {
  current_count: number
  soft_cap: number
  hard_cap: number
  status: 'ok' | 'soft_warning' | 'hard_cap_exceeded'
  retry_after_iso?: string  // ISO timestamp when the cap window opens up
}

export async function checkPublishCap(clientId: string): Promise<CapCheckResult> {
  const sb = createSupabaseServiceClient()
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

  // Count publishes in last 24h that aren't cancelled
  const { count } = await sb
    .from('wv_be_publishes')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .gte('created_at', since)
    .neq('status', 'cancelled')

  // TODO Slice 9: per-brand override from wv_be_clients.metadata
  const softCap = DEFAULT_SOFT_CAP
  const hardCap = DEFAULT_HARD_CAP
  const currentCount = count ?? 0

  if (currentCount >= hardCap) {
    // retry_after = oldest publish in window expires from sliding window
    const { data: oldest } = await sb
      .from('wv_be_publishes')
      .select('created_at')
      .eq('client_id', clientId)
      .gte('created_at', since)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    const retryAfter = oldest
      ? new Date(new Date(oldest.created_at as string).getTime() + 24 * 3600 * 1000).toISOString()
      : undefined
    return { current_count: currentCount, soft_cap: softCap, hard_cap: hardCap, status: 'hard_cap_exceeded', retry_after_iso: retryAfter }
  }

  if (currentCount >= softCap) {
    return { current_count: currentCount, soft_cap: softCap, hard_cap: hardCap, status: 'soft_warning' }
  }

  return { current_count: currentCount, soft_cap: softCap, hard_cap: hardCap, status: 'ok' }
}
