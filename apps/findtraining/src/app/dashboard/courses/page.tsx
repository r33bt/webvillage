// app/dashboard/courses/page.tsx
// Server Component — Course management list for the authenticated provider.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { FtCourse } from '@webvillage/engine/types/ft'

export const metadata: Metadata = {
  title: 'Courses | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

// Tier course limits
const TIER_LIMITS: Record<string, number | null> = {
  free: 0,
  starter: 5,
  founding: 5,
  pro: null, // unlimited
}

const DELIVERY_LABELS: Record<string, string> = {
  'in-person': 'In-Person',
  virtual: 'Virtual',
  'e-learning': 'E-Learning',
  hybrid: 'Hybrid',
}

const DELIVERY_COLORS: Record<string, string> = {
  'in-person': 'bg-blue-50 text-blue-700',
  virtual: 'bg-purple-50 text-purple-700',
  'e-learning': 'bg-teal-50 text-teal-700',
  hybrid: 'bg-orange-50 text-orange-700',
}

export default async function DashboardCoursesPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch provider claimed by this user
  const { data: provider, error: providerError } = await supabase
    .from('ft_providers')
    .select('id, name, slug, tier, profile_status')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/courses] provider fetch error:', providerError.message)
  }

  // Fetch courses if provider exists
  let courses: FtCourse[] = []
  if (provider) {
    const { data: coursesData, error: coursesError } = await supabase
      .from('ft_courses')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: true })

    if (coursesError) {
      console.error('[dashboard/courses] courses fetch error:', coursesError.message)
    } else {
      courses = (coursesData ?? []) as FtCourse[]
    }
  }

  const tier = provider?.tier ?? 'free'
  const limit = TIER_LIMITS[tier] ?? 0
  const courseCount = courses.length
  const atLimit = limit !== null && courseCount >= limit
  const canAdd = provider && (limit === null || courseCount < limit)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: '#0F6FEC1A' }}
          >
            <BookOpen className="w-6 h-6" style={{ color: '#0F6FEC' }} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Courses</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {provider
                ? `Manage training programmes for ${provider.name}`
                : 'Manage your training courses'}
            </p>
          </div>
        </div>

        {canAdd && (
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0"
            style={{ backgroundColor: '#0F6FEC', outlineColor: '#0F6FEC' }}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Course
          </Link>
        )}
      </div>

      {/* No provider claimed */}
      {!provider && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-amber-900 mb-1">No profile claimed yet</h2>
              <p className="text-sm text-amber-800 leading-relaxed mb-4">
                You need to claim a provider listing before you can add courses.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#0F6FEC' }}
              >
                Browse providers
              </Link>
            </div>
          </div>
        </div>
      )}

      {provider && (
        <>
          {/* Course count + limit bar */}
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{courseCount}</span>
              {limit !== null ? (
                <>
                  {' / '}
                  <span className="font-semibold text-gray-900">{limit}</span>
                  {' courses — '}
                  <span className="capitalize">{tier}</span>
                  {' plan'}
                </>
              ) : (
                <> courses — <span className="capitalize">{tier}</span> plan (unlimited)</>
              )}
            </div>
            {atLimit && (
              <Link
                href="/dashboard/billing"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                style={{ borderColor: '#0F6FEC', color: '#0F6FEC' }}
              >
                Upgrade for more
              </Link>
            )}
          </div>

          {/* Free tier — can't add courses */}
          {tier === 'free' && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-400" aria-hidden="true" />
              <h2 className="text-base font-semibold text-blue-900 mb-1">Upgrade to add courses</h2>
              <p className="text-sm text-blue-700 mb-4">
                Free listings can&apos;t add course listings. Upgrade to Starter or Pro to showcase your training programmes.
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

          {/* Course list */}
          {tier !== 'free' && courses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-700 mb-1">No courses yet</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add your first training programme to showcase it on your public profile.
              </p>
              <Link
                href="/dashboard/courses/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#0F6FEC' }}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add your first course
              </Link>
            </div>
          )}

          {courses.length > 0 && (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-sm font-semibold text-gray-900">{course.title}</h2>
                      {course.delivery_method && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DELIVERY_COLORS[course.delivery_method] ?? 'bg-gray-100 text-gray-700'}`}>
                          {DELIVERY_LABELS[course.delivery_method] ?? course.delivery_method}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {course.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {course.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">{course.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/dashboard/courses/${course.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      aria-label={`Edit ${course.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Inline delete button — client interaction via form POST to API
function DeleteCourseButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  return (
    <form
      action={`/api/courses/${courseId}`}
      method="POST"
      onSubmit={(e) => {
        if (!confirm(`Delete "${courseTitle}"? This cannot be undone.`)) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        aria-label={`Delete ${courseTitle}`}
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        Delete
      </button>
    </form>
  )
}
