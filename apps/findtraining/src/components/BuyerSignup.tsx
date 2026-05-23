'use client'

// BuyerSignup — lightweight inline email-capture for category, country, and
// homepage contexts. Posts to /api/buyer-signup. Idempotent — submitting
// the same email twice silently succeeds.

import { useState, FormEvent } from 'react'
import { Mail, Check } from 'lucide-react'

interface BuyerSignupProps {
  countryCode?: string
  categorySlug?: string
  stateSlug?: string
  sourceLabel?: string
  // Customisation
  heading?: string
  subheading?: string
  buttonLabel?: string
  variant?: 'banner' | 'card'
}

export function BuyerSignup({
  countryCode,
  categorySlug,
  stateSlug,
  sourceLabel,
  heading = 'Get new training providers in your inbox',
  subheading = 'One email a month with new providers in your category. No spam, unsubscribe any time.',
  buttonLabel = 'Notify me',
  variant = 'card',
}: BuyerSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('submitting')
    setErrorMessage(null)
    try {
      const res = await fetch('/api/buyer-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          country_code: countryCode ?? null,
          category_slug: categorySlug ?? null,
          state_slug: stateSlug ?? null,
          source_url: typeof window !== 'undefined' ? window.location.pathname : null,
          source_label: sourceLabel ?? null,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Signup failed')
      }
      setStatus('done')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  if (status === 'done') {
    return (
      <div
        className={
          variant === 'banner'
            ? 'rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3'
            : 'rounded-xl bg-green-50 border border-green-200 px-5 py-6 text-center'
        }
      >
        <Check className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-green-800">
          <span className="font-semibold">You&rsquo;re on the list.</span> We&rsquo;ll only email when there&rsquo;s a real reason to.
        </p>
      </div>
    )
  }

  const containerClass =
    variant === 'banner'
      ? 'rounded-lg bg-blue-50 border border-blue-100 px-4 py-3'
      : 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm'

  return (
    <div className={containerClass}>
      <div className={variant === 'banner' ? 'flex flex-col sm:flex-row sm:items-center gap-3' : ''}>
        <div className={variant === 'banner' ? 'flex-1 min-w-0' : 'mb-4 text-center'}>
          <div className={variant === 'banner' ? 'flex items-center gap-2 mb-1' : 'flex flex-col items-center gap-2 mb-2'}>
            {variant === 'card' && (
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-brand-blue" aria-hidden="true" />
              </div>
            )}
            <p className={variant === 'banner' ? 'text-sm font-semibold text-gray-900' : 'text-base font-semibold text-gray-900'}>
              {heading}
            </p>
          </div>
          <p className={variant === 'banner' ? 'text-xs text-gray-600' : 'text-sm text-gray-500'}>{subheading}</p>
        </div>
        <form onSubmit={handleSubmit} className={variant === 'banner' ? 'flex gap-2 flex-shrink-0' : 'flex flex-col sm:flex-row gap-2'}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
            disabled={status === 'submitting'}
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {status === 'submitting' ? 'Saving…' : buttonLabel}
          </button>
        </form>
      </div>
      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
      )}
    </div>
  )
}
