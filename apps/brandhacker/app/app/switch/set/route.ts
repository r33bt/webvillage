import { NextRequest, NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/lib/supabase'
import { getRequestAuthClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin

  const supabase = getRequestAuthClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const formData = await request.formData()
  const tenantId = formData.get('tenant_id') as string | null

  if (!tenantId) {
    return NextResponse.redirect(`${origin}/app/switch`)
  }

  // Verify user actually has access to this tenant
  const sb = getServiceRoleClient()
  const { data: link } = await sb
    .from('wv_be_client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .eq('client_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle()

  if (!link) {
    return NextResponse.redirect(`${origin}/app/switch`)
  }

  const response = NextResponse.redirect(`${origin}/app`)
  response.cookies.set('bh_current_tenant_id', tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return response
}