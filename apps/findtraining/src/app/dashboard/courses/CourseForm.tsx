'use client'

// CourseForm.tsx — Shared create/edit form for ft_courses.
// Used by /dashboard/courses/new and /dashboard/courses/[id]/edit.

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { FtCourse, FtCategory } from '@webvillage/engine/types/ft'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DeliveryMethodOption = 'in-person' | 'virtual' | 'e-learning' | 'hybrid'

const DELIVERY_OPTIONS: { value: DeliveryMethodOption; label: string }[] = [
  { value: 'in-person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual / Online Live' },
  { value: 'e-learning', label: 'E-Learning (Self-Paced)' },
  { value: 'hybrid', label: 'Hybrid' },
]

interface CourseFormProps {
  /** undefined = create mode; defined = edit mode */
  course?: FtCourse
  categories: FtCategory[]
  providerId: string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseForm({ course, categories, providerId }: CourseFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isEdit = Boolean(course)

  const [form, setForm] = useState({
    title: course?.title ?? '',
    slug: course?.slug ?? '',
    description: course?.description ?? '',
    delivery_method: (course?.delivery_method ?? '') as DeliveryMethodOption | '',
    duration_days: course?.duration_days != null ? String(course.duration_days) : '',
    price_min: course?.price_min != null ? String(course.price_min) : '',
    price_max: course?.price_max != null ? String(course.price_max) : '',
    hrdf_claimable: course?.hrdf_claimable ?? true,
    active: course?.active ?? true,
    category_id: course?.category_id ?? '',
  })

  const [slugManual, setSlugManual] = useState(Boolean(course))

  function handleText(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      // Auto-slug from title unless user has manually edited slug
      if (name === 'title' && !slugManual) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  function handleSlug(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true)
    setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))
  }

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: checked }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.title.trim()) {
      setErrorMsg('Course title is required.')
      setSaveStatus('error')
      return
    }
    if (!form.slug.trim()) {
      setErrorMsg('Slug is required.')
      setSaveStatus('error')
      return
    }

    setSaveStatus('saving')
    setErrorMsg('')

    const payload = {
      provider_id: providerId,
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      delivery_method: form.delivery_method || null,
      duration_days: form.duration_days ? parseInt(form.duration_days, 10) : null,
      price_min: form.price_min ? parseFloat(form.price_min) : null,
      price_max: form.price_max ? parseFloat(form.price_max) : null,
      hrdf_claimable: form.hrdf_claimable,
      active: form.active,
      category_id: form.category_id || null,
    }

    startTransition(async () => {
      try {
        const url = isEdit ? `/api/courses/${course!.id}` : '/api/courses'
        const method = isEdit ? 'PATCH' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const json = await res.json()

        if (!res.ok) {
          setErrorMsg(json.error ?? 'Something went wrong.')
          setSaveStatus('error')
          return
        }

        setSaveStatus('saved')
        router.push('/dashboard/courses')
        router.refresh()
      } catch {
        setErrorMsg('Network error. Please try again.')
        setSaveStatus('error')
      }
    })
  }

  const isDisabled = isPending || saveStatus === 'saving'

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="cf-title" className="block text-sm font-medium text-gray-700 mb-1">
          Course Title <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="cf-title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleText}
          disabled={isDisabled}
          placeholder="e.g. Business Communication Skills"
          className={inputClass}
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="cf-slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="cf-slug"
          name="slug"
          type="text"
          required
          value={form.slug}
          onChange={handleSlug}
          disabled={isDisabled}
          placeholder="business-communication-skills"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">URL-friendly identifier. Auto-generated from title.</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="cf-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="cf-description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleText}
          disabled={isDisabled}
          placeholder="Describe what this course covers, who it's for, and key outcomes."
          className={inputClass + ' resize-y'}
        />
      </div>

      {/* Delivery method + Category row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-delivery" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Method
          </label>
          <select
            id="cf-delivery"
            name="delivery_method"
            value={form.delivery_method}
            onChange={handleText}
            disabled={isDisabled}
            className={inputClass}
          >
            <option value="">— Select method —</option>
            {DELIVERY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cf-category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            id="cf-category"
            name="category_id"
            value={form.category_id}
            onChange={handleText}
            disabled={isDisabled}
            className={inputClass}
          >
            <option value="">— No category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Duration + Price range row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="cf-duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (days)
          </label>
          <input
            id="cf-duration"
            name="duration_days"
            type="number"
            min="1"
            step="1"
            value={form.duration_days}
            onChange={handleText}
            disabled={isDisabled}
            placeholder="e.g. 2"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="cf-price-min" className="block text-sm font-medium text-gray-700 mb-1">
            Price Min (MYR)
          </label>
          <input
            id="cf-price-min"
            name="price_min"
            type="number"
            min="0"
            step="0.01"
            value={form.price_min}
            onChange={handleText}
            disabled={isDisabled}
            placeholder="e.g. 800"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="cf-price-max" className="block text-sm font-medium text-gray-700 mb-1">
            Price Max (MYR)
          </label>
          <input
            id="cf-price-max"
            name="price_max"
            type="number"
            min="0"
            step="0.01"
            value={form.price_max}
            onChange={handleText}
            disabled={isDisabled}
            placeholder="e.g. 1500"
            className={inputClass}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="hrdf_claimable"
            checked={form.hrdf_claimable}
            onChange={handleCheckbox}
            disabled={isDisabled}
            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">HRDF Claimable</span>
            <span className="block text-xs text-gray-500 mt-0.5">
              This course is eligible for HRD Corp (HRDF) reimbursement.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleCheckbox}
            disabled={isDisabled}
            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Active (visible on profile)</span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Uncheck to hide this course without deleting it.
            </span>
          </span>
        </label>
      </div>

      {/* Error / success feedback */}
      {saveStatus === 'error' && errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5" role="alert">
          {errorMsg}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isDisabled}
          className="px-8 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#0F6FEC', outlineColor: '#0F6FEC' }}
        >
          {isDisabled ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Course'}
        </button>
        <a
          href="/dashboard/courses"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
