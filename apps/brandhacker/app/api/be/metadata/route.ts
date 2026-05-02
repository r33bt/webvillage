/**
 * PATCH /api/be/metadata
 * Merges a partial patch into wv_be_clients.metadata jsonb for the given tenant.
 *
 * Supports two top-level keys:
 *   design_tokens — { brand_color, heading_font, ... }
 *   brand_facts   — { name, mission, faq, ... }
 *
 * Each key is shallow-merged into the existing metadata value.
 * Other top-level keys in metadata (e.g. slug, content_pillars) are untouched.
 *
 * Flow:
 *  1. Auth check (requireAuth)
 *  2. Zod validation { tenant_id, patch }
 *  3. Ownership check (wv_be_client_users)
 *  4. Fetch current metadata
 *  5. Merge patch keys
 *  6. UPDATE wv_be_clients.metadata
 *  7. Return { metadata }
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getServiceRoleClient, type ClientMetadata } from '@/lib/supabase'
import { requireAuth } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const DesignTokensSchema = z
  .object({
    brand_color: z.string().optional(),
    heading_font: z.string().optional(),
  })
  .passthrough()

const BrandFactsSchema = z
  .object({
    name: z.string().max(200).optional(),
    mission: z.string().max(500).optional(),
    faq: z
      .array(z.object({ q: z.string().max(300), a: z.string().max(1000) }))
      .max(10)
      .optional(),
  })
  .passthrough()

const PatchSchema = z
  .object({
    design_tokens: DesignTokensSchema.optional(),
    brand_facts: BrandFactsSchema.optional(),
  })
  .refine(
    (data) => data.design_tokens !== undefined || data.brand_facts !== undefined,
    { message: 'patch must include at least one of: design_tokens, brand_facts' },
  )

const RequestSchema = z.object({
  tenant_id: z.string().uuid({ message: 'tenant_id must be a valid UUID' }),
  patch: PatchSchema,
})

// ---------------------------------------------------------------------------
// PATCH /api/be/metadata
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  // 1. Auth
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult

  // 2. Parse + validate
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { tenant_id, patch } = parsed.data
  const sb = getServiceRoleClient()

  // 3. Verify ownership
  const { data: membership } = await sb
    .from('wv_be_client_users')
    .select('client_id')
    .eq('client_id', tenant_id)
    .eq('user_id', authResult.user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!membership) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 4. Fetch current metadata
  const { data: client, error: fetchErr } = await sb
    .from('wv_be_clients')
    .select('metadata')
    .eq('id', tenant_id)
    .is('deleted_at', null)
    .maybeSingle()

  if (fetchErr || !client) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // 5. Shallow-merge each patch key into existing metadata
  const current = (client.metadata ?? {}) as ClientMetadata
  const updated: ClientMetadata = { ...current }

  if (patch.design_tokens) {
    updated.design_tokens = {
      ...(current.design_tokens ?? {}),
      ...patch.design_tokens,
    }
  }

  if (patch.brand_facts) {
    updated.brand_facts = {
      ...(current.brand_facts ?? {}),
      ...patch.brand_facts,
    }
  }

  // 6. Persist
  const { error: updateErr } = await sb
    .from('wv_be_clients')
    .update({ metadata: updated })
    .eq('id', tenant_id)

  if (updateErr) {
    console.error('[be/metadata] update error', { tenant_id, error: updateErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  // 7. Return updated metadata
  return Response.json({ metadata: updated })
}
