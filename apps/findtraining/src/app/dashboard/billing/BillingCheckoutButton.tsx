'use client'

// BillingCheckoutButton.tsx
// Client Component — triggers Stripe Checkout by calling POST /api/stripe/checkout.
// Uses the session JWT from Supabase client for authentication.

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type Props = {
  plan: 'starter' | 'pro'
  label: string
  primary?: boolean
}

function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function BillingCheckoutButton({ plan, label, primary = false }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)

    try {
      // Get session token for authenticated request
      const supabase = getBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      })

      const json = await res.json()

      if (!res.ok || !json.url) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = json.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const baseClass =
    'inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const primaryClass = `${baseClass} text-white`
  const secondaryClass = `${baseClass} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50`

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={primary ? primaryClass : secondaryClass}
        style={primary ? { backgroundColor: '#0F6FEC', outlineColor: '#0F6FEC' } : undefined}
        aria-busy={loading}
      >
        {loading ? 'Redirecting to checkout…' : label}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
