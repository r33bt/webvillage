// PATCH /api/courses/[id] — update a course
// DELETE /api/courses/[id] — delete a course
// Ownership is always verified: course.provider_id JOIN ft_providers.claimed_by = auth.uid()

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ---------------------------------------------------------------------------
// PATCH — update course fields
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Verify ownership: course must belong to a provider claimed by this user
    const { data: owned, error: ownerError } = await supabase
      .from('ft_courses')
      .select('id, ft_providers!inner(claimed_by)')
      .eq('id', id)
      .maybeSingle()

    if (ownerError) {
      console.error('[api/courses PATCH] ownership check error:', ownerError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    if (!owned) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    const providerData = owned.ft_providers as unknown as { claimed_by: string | null }
    if (!providerData || providerData.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
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

    // Build update payload — only include fields present in body
    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = String(title).trim()
    if (slug !== undefined) updates.slug = String(slug).trim()
    if (description !== undefined) updates.description = description ? String(description).trim() || null : null
    if (delivery_method !== undefined) updates.delivery_method = delivery_method || null
    if (duration_days !== undefined) updates.duration_days = duration_days != null ? Number(duration_days) : null
    if (price_min !== undefined) updates.price_min = price_min != null ? Number(price_min) : null
    if (price_max !== undefined) updates.price_max = price_max != null ? Number(price_max) : null
    if (hrdf_claimable !== undefined) updates.hrdf_claimable = Boolean(hrdf_claimable)
    if (active !== undefined) updates.active = Boolean(active)
    if (category_id !== undefined) updates.category_id = category_id || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('ft_courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'A course with this slug already exists for your provider.' },
          { status: 409 }
        )
      }
      console.error('[api/courses PATCH] update error:', updateError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    return NextResponse.json({ course: updated }, { status: 200 })
  } catch (err) {
    console.error('[api/courses PATCH] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete a course
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Verify ownership
    const { data: owned, error: ownerError } = await supabase
      .from('ft_courses')
      .select('id, ft_providers!inner(claimed_by)')
      .eq('id', id)
      .maybeSingle()

    if (ownerError) {
      console.error('[api/courses DELETE] ownership check error:', ownerError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    if (!owned) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    const providerData = owned.ft_providers as unknown as { claimed_by: string | null }
    if (!providerData || providerData.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('ft_courses')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[api/courses DELETE] delete error:', deleteError.message)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[api/courses DELETE] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST — form-based fallback for DELETE (HTML forms can't send DELETE)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, context: RouteContext) {
  const body = await request.formData().catch(() => null)
  if (body && body.get('_method') === 'DELETE') {
    return DELETE(request, context)
  }
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
