import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServiceRoleClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as any),
          )
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchange error', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  const sb = getServiceRoleClient()

  // Check for existing tenant links
  const { data: existingLinks } = await sb
    .from('wv_be_client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const safeNext = next.startsWith('/') ? next : '/app'

  if (!existingLinks || existingLinks.length === 0) {
    // New user — provision a tenant
    const emailPrefix = user.email?.split('@')[0] ?? 'brand'
    const slug = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const displayName = user.user_metadata?.full_name ?? emailPrefix

    const { data: newClient } = await sb
      .from('wv_be_clients')
      .insert({
        display_name: displayName,
        current_tier: 'free_trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        lifecycle_stage: 'onboarding',
        metadata: { slug },
      })
      .select('id')
      .single()

    if (newClient) {
      await sb.from('wv_be_client_users').insert({
        client_id: newClient.id,
        user_id: user.id,
        role: 'admin',
        accepted_at: new Date().toISOString(),
      })

      const response = NextResponse.redirect(`${origin}/app/onboarding`)
      response.cookies.set('bh_current_tenant_id', newClient.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      })
      return response
    }

    return NextResponse.redirect(`${origin}/app`)
  }

  // Returning user — set/refresh tenant cookie
  const currentTenantId = existingLinks[0]!.client_id
  const response = NextResponse.redirect(`${origin}${safeNext}`)
  response.cookies.set('bh_current_tenant_id', currentTenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return response
}
