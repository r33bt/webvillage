import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAdminClient } from '../../../lib/supabase-server'
import { TENANT_COOKIE } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  const formData = await request.formData()
  const tenantId = formData.get('tenant_id')?.toString()

  if (!tenantId) {
    return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })
  }

  // Verify the user actually has access to this tenant before setting the cookie
  const admin = createAdminClient()
  const { data } = await admin
    .from('wv_be_client_users')
    .select('client_id')
    .eq('user_id', authResult.user.id)
    .eq('client_id', tenantId)
    .is('deleted_at', null)
    .not('accepted_at', 'is', null)
    .maybeSingle()

  if (!data) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 403 })
  }

  const referer = request.headers.get('referer') ?? '/app'
  const response = NextResponse.redirect(new URL('/app', request.url))

  response.cookies.set(TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
