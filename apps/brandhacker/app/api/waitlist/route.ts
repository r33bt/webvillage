import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  name: z.string().max(120).optional(),
  pain_point: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const sb = getServiceRoleClient()
  const { error } = await sb.from('bh_waitlist').upsert(
    {
      email: parsed.data.email.toLowerCase().trim(),
      name: parsed.data.name?.trim() || null,
      pain_point: parsed.data.pain_point?.trim() || null,
      source: 'website',
    },
    { onConflict: 'email', ignoreDuplicates: false },
  )

  if (error) {
    console.error('[waitlist] insert error', error.message)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
