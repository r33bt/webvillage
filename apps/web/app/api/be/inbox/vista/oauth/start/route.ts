// apps/web/app/api/be/inbox/vista/oauth/start/route.ts
// Slice 7 OAuth init — redirects to Vista's authorize URL with signed state.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signOAuthState, buildAuthorizeUrl } from '@/lib/vista-oauth'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const clientId = url.searchParams.get('client_id')
  if (!clientId || !z.string().uuid().safeParse(clientId).success) {
    return NextResponse.json({ error: 'invalid_client_id' }, { status: 400 })
  }

  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const redirectUri = `${proto}://${host}/api/be/inbox/vista/oauth/callback`

  let state: string
  let authorizeUrl: string
  try {
    state = signOAuthState(clientId)
    authorizeUrl = buildAuthorizeUrl(state, redirectUri)
  } catch (err) {
    return NextResponse.json(
      { error: 'oauth_init_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  return NextResponse.redirect(authorizeUrl, { status: 302 })
}
