'use client'

import { useState } from 'react'

export default function WaitlistPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const body = {
      name: (fd.get('name') as string).trim(),
      email: (fd.get('email') as string).trim(),
      pain_point: (fd.get('pain_point') as string).trim(),
    }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setErrorMsg(data.error ?? 'Something went wrong. Try again.')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setErrorMsg('Network error. Check your connection and try again.')
      setState('error')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-lg px-6 py-20 sm:py-28">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Early access</div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
          Join the waitlist
        </h1>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          BrandHacker is in closed development. Leave your details and we will reach out when your spot is ready.
        </p>

        {state === 'done' ? (
          <div className="mt-10 space-y-8">
            <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/60 px-6 py-6">
              <p className="text-emerald-300 font-medium">You are on the list.</p>
              <p className="mt-1 text-sm text-emerald-400">We will be in touch when your spot is ready.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-4">While you wait</p>
              <div className="space-y-3">
                <a
                  href="/case-study/v22-multibrand"
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm text-zinc-300 hover:border-zinc-700 hover:text-zinc-50 transition-colors"
                >
                  <span>Read the V22 case study</span>
                  <span className="text-zinc-600">→</span>
                </a>
                <a
                  href="/pat/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm text-zinc-300 hover:border-zinc-700 hover:text-zinc-50 transition-colors"
                >
                  <span>See a live AEO surface ↗</span>
                  <span className="text-zinc-600">→</span>
                </a>
                <a
                  href="/login"
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm text-zinc-300 hover:border-zinc-700 hover:text-zinc-50 transition-colors"
                >
                  <span>Already have an account? Sign in</span>
                  <span className="text-zinc-600">→</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-[0.15em] text-zinc-400 mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-[0.15em] text-zinc-400 mb-2">
                Email <span className="text-zinc-600">(required)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="pain_point" className="block text-xs uppercase tracking-[0.15em] text-zinc-400 mb-2">
                What is your biggest brand consistency headache?
              </label>
              <textarea
                id="pain_point"
                name="pain_point"
                rows={3}
                placeholder="Optional — helps us prioritise what to build first"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none"
              />
            </div>

            {state === 'error' && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full rounded-md bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              {state === 'loading' ? 'Saving…' : 'Request early access'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
