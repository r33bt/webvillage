// app/dashboard/courses/[id]/edit/page.tsx
// Server Component — Edit an existing course.

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CourseForm } from '../../CourseForm'
import type { Metadata } from 'next'
import type { FtCourse, FtCategory } from '@webvillage/engine/types/ft'

export const metadata: Metadata = {
  title: 'Edit Course | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params
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
    .select('id, name')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/courses/edit] provider error:', providerError.message)
  }

  if (!provider) {
    redirect('/dashboard/courses')
  }

  // Fetch the course — must belong to this provider
  const { data: courseData, error: courseError } = await supabase
    .from('ft_courses')
    .select('*')
    .eq('id', id)
    .eq('provider_id', provider.id)
    .maybeSingle()

  if (courseError) {
    console.error('[dashboard/courses/edit] course error:', courseError.message)
  }

  if (!courseData) {
    notFound()
  }

  const course = courseData as FtCourse

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
        <span className="text-gray-700">Edit</span>
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
          <h1 className="text-xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{course.title}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <CourseForm course={course} categories={categories} providerId={provider.id} />
      </div>
    </div>
  )
}
