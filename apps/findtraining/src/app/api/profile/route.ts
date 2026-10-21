// PATCH /api/profile
// Updates the ft_providers row claimed by the authenticated user.
// Never allows editing: id, slug, hrdf_registered, regulatory_body_id, profile_status.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type DeliveryMethod = 'in-person' | 'virtual' | 'e-learning' | 'hybrid'

const VALID_DELIVERY_METHODS: DeliveryMethod[] = [
  'in-person',
  'virtual',
  'e-learning',
  'hybrid',
]

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function createAuthClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: Array<{
            name: string
            value: string
            options?: Record<string, unknown>
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(
                name,
                value,
                options as Parameters<typeof cookieStore.set>[2]
              )
            })
          } catch {
            // Route Handler — safe to ignore
          }
        },
      },
    }
  )
}

function isMissingColumnError(error: { code?: string; message?: string }): boolean {
  // PostgREST schema cache miss (PGRST204) or Postgres undefined_column (42703)
  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    (error.message ?? '').includes('description_edited_by_owner')
  )
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createAuthClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
    }

    // Parse body
    const body = await request.json()

    const {
      name,
      description,
      logo_url,
      website,
      email,
      phone,
      address,
      state,
      delivery_methods,
    } = body as {
      name?: unknown
      description?: unknown
      logo_url?: unknown
      website?: unknown
      email?: unknown
      phone?: unknown
      address?: unknown
      state?: unknown
      delivery_methods?: unknown
    }

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company name is required.' },
        { status: 400 }
      )
    }

    // Validate optional URL fields
    if (
      logo_url &&
      typeof logo_url === 'string' &&
      logo_url.trim().length > 0 &&
      !isValidUrl(logo_url.trim())
    ) {
      return NextResponse.json(
        { error: 'Logo URL must be a valid https:// URL.' },
        { status: 400 }
      )
    }

    if (
      website &&
      typeof website === 'string' &&
      website.trim().length > 0 &&
      !isValidUrl(website.trim())
    ) {
      return NextResponse.json(
        { error: 'Website must be a valid https:// URL.' },
        { status: 400 }
      )
    }

    // Validate delivery_methods
    let sanitisedDelivery: DeliveryMethod[] = []
    if (Array.isArray(delivery_methods)) {
      sanitisedDelivery = delivery_methods.filter((m): m is DeliveryMethod =>
        VALID_DELIVERY_METHODS.includes(m as DeliveryMethod)
      )
    }

    // Build the safe update payload (never includes protected columns)
    const updatePayload: Record<string, unknown> = {
      name: name.trim(),
      description:
        typeof description === 'string' && description.trim().length > 0
          ? description.trim()
          : null,
      logo_url:
        typeof logo_url === 'string' && logo_url.trim().length > 0
          ? logo_url.trim()
          : null,
      website:
        typeof website === 'string' && website.trim().length > 0
          ? website.trim()
          : null,
      email:
        typeof email === 'string' && email.trim().length > 0
          ? email.trim().toLowerCase()
          : null,
      phone:
        typeof phone === 'string' && phone.trim().length > 0
          ? phone.trim()
          : null,
      address:
        typeof address === 'string' && address.trim().length > 0
          ? address.trim()
          : null,
      state:
        typeof state === 'string' && state.trim().length > 0
          ? state.trim()
          : null,
      delivery_methods: sanitisedDelivery,
      updated_at: new Date().toISOString(),
    }

    // The public "From the provider" label needs to know the owner wrote the description,
    // not just that the profile is claimed (it may still hold the seeded text). Mark it only
    // when the saved description differs from what is stored.
    const { data: current } = await supabase
      .from('ft_providers')
      .select('description')
      .eq('claimed_by', user.id)
      .maybeSingle()
    const descriptionChanged =
      updatePayload.description !== null &&
      updatePayload.description !== ((current as { description: string | null } | null)?.description ?? null)
    if (descriptionChanged) updatePayload.description_edited_by_owner = true

    // UPDATE — ownership enforced via claimed_by = auth.uid()
    let { error: updateError } = await supabase
      .from('ft_providers')
      .update(updatePayload)
      .eq('claimed_by', user.id)

    // Column missing (migration 20261021000001 not applied yet): save without the flag.
    if (updateError && 'description_edited_by_owner' in updatePayload && isMissingColumnError(updateError)) {
      delete updatePayload.description_edited_by_owner
      ;({ error: updateError } = await supabase
        .from('ft_providers')
        .update(updatePayload)
        .eq('claimed_by', user.id))
    }

    if (updateError) {
      console.error('[api/profile] update error:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to save profile. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[api/profile] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
