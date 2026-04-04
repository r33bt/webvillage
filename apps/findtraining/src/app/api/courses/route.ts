// POST /api/courses — create a new course
// GET  /api/courses — list courses for auth user's provider

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Tier course limits (null = unlimited)
const TIER_LIMITS: Record<string, number | null> = {
  free: 0,
  starter: 5,
  founding: 5,
  pro: null,
}

// ---------------------------------------------------------------------------
// GET — list courses for the authenticated provider
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: provider, error: providerError } = await supabase
      .from('ft_providers')
      .select('id')
      .eq('claimed_by', user.id)
      .maybeSingle()

    if (providerError) {
      console.error('[api/courses GET] provider error:', providerError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    if (!provider) {
      return NextResponse.json({ courses: [] }, { status: 200 })
    }

    const { data: courses, error: coursesError } = await supabase
      .from('ft_courses')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: true })

    if (coursesError) {
      console.error('[api/courses GET] courses error:', coursesError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    return NextResponse.json({ courses: courses ?? [] }, { status: 200 })
  } catch (err) {
    console.error('[api/courses GET] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST — create a course
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Get provider + tier
    const { data: provider, error: providerError } = await supabase
      .from('ft_providers')
      .select('id, tier')
      .eq('claimed_by', user.id)
      .maybeSingle()

    if (providerError) {
      console.error('[api/courses POST] provider error:', providerError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    if (!provider) {
      return NextResponse.json({ error: 'No claimed provider found.' }, { status: 403 })
    }

    const tier = provider.tier ?? 'free'
    const limit = TIER_LIMITS[tier] ?? 0

    // Enforce tier limits
    if (limit !== null) {
      if (limit === 0) {
        return NextResponse.json(
          { error: 'Free listings cannot add courses. Please upgrade your plan.' },
          { status: 403 }
        )
      }

      const { count } = await supabase
        .from('ft_courses')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', provider.id)

      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: `You've reached the ${limit}-course limit for the ${tier} plan. Upgrade to Pro for unlimited courses.` },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      delivery_method,
      duration_days,
      price_min,
      price_max,
      hrdf_claimable,
      active,
      category_id,
    } = body as Record<string, unknown>

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    }
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })
    }

    const { data: created, error: insertError } = await supabase
      .from('ft_courses')
      .insert({
        provider_id: provider.id,
        title: String(title).trim(),
        slug: String(slug).trim(),
        description: description ? String(description).trim() || null : null,
        delivery_method: delivery_method || null,
        duration_days: duration_days != null ? Number(duration_days) : null,
        price_min: price_min != null ? Number(price_min) : null,
        price_max: price_max != null ? Number(price_max) : null,
        hrdf_claimable: hrdf_claimable !== false,
        active: active !== false,
        category_id: category_id || null,
        currency_code: 'MYR',
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'A course with this slug already exists for your provider.' },
          { status: 409 }
        )
      }
      console.error('[api/courses POST] insert error:', insertError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    return NextResponse.json({ course: created }, { status: 201 })
  } catch (err) {
    console.error('[api/courses POST] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
