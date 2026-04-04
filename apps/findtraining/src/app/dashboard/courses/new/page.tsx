// app/dashboard/courses/new/page.tsx
// Server Component — Add a new course for the authenticated provider.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CourseForm } from '../CourseForm'
import type { Metadata } from 'next'
import type { FtCategory } from '@webvillage/engine/types/ft'

export const metadata: Metadata = {
  title: 'Add Course | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

// Tier course limits
const TIER_LIMITS: Record<string, number | null> = {
  free: 0,
  starter: 5,
  founding: 5,
  pro: null,
}

export default async function NewCoursePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get provider for this user
  const { data: provider, error: providerError } = await supabase
    .from('ft_providers')
    .select('id, name, tier')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/courses/new] provider error:', providerError.message)
  }

  if (!provider) {
    redirect('/dashboard/courses')
  }

  const tier = provider.tier ?? 'free'
  const limit = TIER_LIMITS[tier] ?? 0

  // Check existing course count
  const { count: courseCount } = await supabase
    .from('ft_courses')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', provider.id)

  const atLimit = limit !== null && (courseCount ?? 0) >= limit
  const isFree = tier === 'free'

  // Fetch categories for the select
  const { data: categoriesData } = await supabase
    .from('ft_categories')
    .select('id, slug, name, description, display_order, active, created_at')
    .eq('active', true)
    .order('display_order', { ascending: true })

  const categories = (categoriesData ?? []) as FtCategory[]

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <Link href="/dashboard/courses" className="hover:text-gray-700">Courses</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-700">New</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <Link
          href="/dashboard/courses"
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors mt-0.5"
          aria-label="Back to courses"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add Course</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add a training programme to your public profile
          </p>
        </div>
      </div>

      {/* Free tier upgrade CTA */}
      {(isFree || atLimit) && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-blue-900 mb-1">
            {isFree ? 'Upgrade to add courses' : 'Course limit reached'}
          </h2>
          <p className="text-sm text-blue-700 mb-4 max-w-sm mx-auto">
            {isFree
              ? 'Free listings cannot add courses. Upgrade to Starter or Pro to showcase your training programmes.'
              : `You've reached the ${limit}-course limit for the ${tier} plan. Upgrade to Pro for unlimited courses.`}
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0F6FEC' }}
          >
            View plans
          </Link>
        </div>
      )}

      {/* Form */}
      {!isFree && !atLimit && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <CourseForm categories={categories} providerId={provider.id} />
        </div>
      )}
    </div>
  )
}
