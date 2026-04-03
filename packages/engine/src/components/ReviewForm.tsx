'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

// Turnstile is optional — only rendered when siteKey is provided
const TURNSTILE_DISABLED = process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === 'true'
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export interface ReviewSubmitData {
  providerId?: string
  serviceId?: string
  rating: number
  title: string
  text: string
}

interface ReviewFormProps {
  /** Generic listing ID (preferred) */
  listingId?: string
  listingName?: string
  /** Legacy aliases for backwards compat */
  providerId?: string
  serviceId?: string
  providerName?: string
  /**
   * Platform-agnostic submit handler.
   * EVA passes its tRPC mutation; FindTraining passes a server action wrapper.
   */
  onSubmitReview: (data: ReviewSubmitData) => Promise<void>
  isSubmitting?: boolean
  /** Whether the platform requires auth before submitting */
  requiresAuth?: boolean
  onAuthRequired?: () => void
}

export function ReviewForm({
  listingId,
  listingName,
  providerId,
  serviceId,
  providerName,
  onSubmitReview,
  isSubmitting = false,
  requiresAuth = false,
  onAuthRequired,
}: ReviewFormProps) {
  const itemId = listingId || providerId
  const itemName = listingName || providerName || 'this listing'

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [formData, setFormData] = useState({ title: '', text: '' })
  const [turnstileToken, setTurnstileToken] = useState(TURNSTILE_DISABLED ? 'bypass' : '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  // Lazy-load Turnstile widget only when siteKey is available
  const [TurnstileComponent, setTurnstileComponent] = useState<React.ComponentType<any> | null>(null)
  if (TURNSTILE_SITE_KEY && !TurnstileComponent && typeof window !== 'undefined') {
    import('@marsidev/react-turnstile').then((m) => setTurnstileComponent(() => m.Turnstile))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (requiresAuth && onAuthRequired) {
      onAuthRequired()
      return
    }
    if (rating === 0) { setError('Please select a rating'); return }
    if (formData.text.length < 50) { setError('Review text must be at least 50 characters'); return }
    if (formData.title.length < 10) { setError('Review title must be at least 10 characters'); return }
    if (TURNSTILE_SITE_KEY && !turnstileToken) { setError('Please complete the verification'); return }

    setPending(true)
    try {
      await onSubmitReview({
        providerId: itemId,
        serviceId,
        rating,
        title: formData.title,
        text: formData.text,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Submitted!</h2>
        <p className="text-muted-foreground">
          Thank you for your review of {itemName}. Your feedback is pending approval.
        </p>
      </div>
    )
  }

  const submitting = pending || isSubmitting

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Rating <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <Star
                className={`w-10 h-10 ${(hoveredRating || rating) >= star ? 'text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500' : 'text-muted-foreground/30'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="rev-title" className="block text-sm font-medium text-foreground mb-2">
          Review Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="rev-title"
          required
          minLength={10}
          maxLength={100}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Summarize your experience"
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
        />
        <p className="text-sm text-muted-foreground mt-1">{formData.title.length}/100 characters</p>
      </div>

      <div>
        <label htmlFor="rev-text" className="block text-sm font-medium text-foreground mb-2">
          Your Review <span className="text-destructive">*</span>
        </label>
        <textarea
          id="rev-text"
          required
          minLength={50}
          maxLength={2000}
          rows={6}
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Share your detailed experience..."
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {formData.text.length}/2000 characters (minimum 50)
        </p>
      </div>

      {/* Turnstile CAPTCHA — rendered only if siteKey is configured */}
      {!TURNSTILE_DISABLED && TURNSTILE_SITE_KEY && TurnstileComponent && (
        <TurnstileComponent
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken('turnstile-error-bypass')}
        />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
