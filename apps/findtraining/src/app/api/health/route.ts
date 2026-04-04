// GET /api/health
// Lightweight health check — returns DB connectivity status.

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    const { count, error } = await supabase
      .from('ft_providers')
      .select('id', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        { status: 'degraded', db: 'error', error: error.message, latency_ms: Date.now() - start },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { status: 'ok', db: 'connected', providers: count, latency_ms: Date.now() - start },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { status: 'error', db: 'unreachable', error: String(err), latency_ms: Date.now() - start },
      { status: 503 }
    )
  }
}
