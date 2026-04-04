'use client'

import { useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface FormData {
  name: string
  organisation: string
  email: string
  message: string
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    organisation: '',
    email: '',
    message: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormState('success')
      } else {
        setFormState('error')
      }
    } catch {
      setFormState('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[40vh] items-center overflow-hidden bg-[#0C1A18]"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 60%, rgba(15,118,110,0.25) 0%, transparent 70%), #0C1A18',
        }}
      >
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#D97706]">
            Discovery call
          </p>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Book a discovery call
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#A8C4C0]">
            We&apos;ll learn about your directory needs, show you a live example, and give you an
            honest answer on fit. No sales pressure.
          </p>
        </div>
      </section>

      {/* ── Form section ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
        {formState === 'success' ? (
          /* ── Success state ─────────────────────────────────────────────── */
          <div className="rounded-2xl border border-[#0F766E]/30 bg-[#0F766E]/10 p-10 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h2 className="mb-3 text-2xl font-bold text-white">Thanks! We&apos;ll be in touch.</h2>
            <p className="text-[#A8C4C0]">
              We&apos;ll respond within 1 business day to arrange your call.
            </p>
          </div>
        ) : (
          /* ── Form ──────────────────────────────────────────────────────── */
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
          >
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-[#A8C4C0]"
                >
                  Name <span className="text-[#D97706]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              {/* Organisation */}
              <div>
                <label
                  htmlFor="organisation"
                  className="mb-1.5 block text-sm font-medium text-[#A8C4C0]"
                >
                  Organisation <span className="text-[#D97706]">*</span>
                </label>
                <input
                  id="organisation"
                  name="organisation"
                  type="text"
                  required
                  value={formData.organisation}
                  onChange={handleChange}
                  placeholder="Chamber of Commerce, Trade Association, etc."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#A8C4C0]"
                >
                  Email <span className="text-[#D97706]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@yourorg.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-[#A8C4C0]"
                >
                  Tell us about your current directory situation{' '}
                  <span className="text-white/30">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="What platform are you on now? How many listings? What's broken?"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              {/* Error state */}
              {formState === 'error' && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">
                    Something went wrong. Email us directly at{' '}
                    <a
                      href="mailto:hello@webvillage.com"
                      className="font-semibold underline hover:text-red-300"
                    >
                      hello@webvillage.com
                    </a>
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="w-full rounded-xl bg-[#D97706] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#B45309] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formState === 'submitting' ? 'Sending…' : 'Request a call →'}
              </button>
            </div>
          </form>
        )}

        {/* ── Reassurance strip ──────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          {[
            { icon: '⏱', text: 'Typical response: 1 business day' },
            { icon: '🤝', text: 'No commitment required' },
            { icon: '🏷', text: 'Founding member pricing available for first 5 clients' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-[#6B7C79]">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
