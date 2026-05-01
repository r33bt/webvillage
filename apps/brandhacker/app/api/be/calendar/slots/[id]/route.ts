import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getServiceRoleClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const PatchSchema = z.object({
  scheduled_for: z.string().datetime({ message: 'scheduled_for must be a valid ISO datetime' }),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof Response) return auth

  const { id } = await params

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = PatchSchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const sb = getServiceRoleClient()

  // Fetch current slot to get reschedule_count
  const { data: existing, error: fetchErr } = await sb
    .from('wv_be_calendar_slots')
    .select('id, reschedule_count, status')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) {
    console.error('[calendar/slots/patch] fetch error', { id, error: fetchErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!existing) {
    return Response.json({ error: 'Slot not found' }, { status: 404 })
  }

  if (existing.status === 'published' || existing.status === 'cancelled') {
    return Response.json(
      { error: `Cannot reschedule a slot with status '${existing.status}'` },
      { status: 409 },
    )
  }

  const { data: updated, error: updateErr } = await sb
    .from('wv_be_calendar_slots')
    .update({
      scheduled_for: parsed.data.scheduled_for,
      reschedule_count: (existing.reschedule_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, scheduled_for, reschedule_count, status, updated_at')
    .single()

  if (updateErr || !updated) {
    console.error('[calendar/slots/patch] update error', { id, error: updateErr?.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  return Response.json(updated)
}
