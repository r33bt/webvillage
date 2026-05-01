'use client'

import { useState } from 'react'
import { getBrowserClient } from '../lib/supabase-browser'

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    const supabase = getBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  async function handleGoogle() {
    const supabase = getBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  if (status === 'sent') {
    return (
      <div className="text-center">
        <div className="mb-4 text-2xl">📬</div>
        <p className="text-zinc-50 font-medium">Check your email</p>
        <p className="mt-2 text-sm text-zinc-400">
          We sent a sign-in link to <span className="text-zinc-300">{email}</span>.
        </p>
        <p className="mt-4 text-xs text-zinc-500">
          Wrong address?{' '}
          <button
            onClick={() => { setStatus('idle'); setEmail('') }}
            className="text-zinc-400 hover:text-zinc-200 underline"
          >
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-lg bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Sending…' : 'Continue with magic link'}
        </button>
      </form>

      {errorMsg && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-zinc-800" />
        <span className="text-xs text-zinc-600">or</span>
        <div className="flex-1 border-t border-zinc-800" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-50 flex items-center justify-center gap-2"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
    </div>
  )
}
