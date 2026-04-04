'use client'

import { useState } from 'react'

interface ClaimFormProps {
  providerId: string
  providerName: string
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

interface FormState {
  name: string
  email: string
  phone: string
  authorised: boolean
}

export function ClaimForm({ providerId, providerName }: ClaimFormProps) {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', authorised: false })
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.authorised) {
      setErrorMsg('Please confirm you are authorised to manage this listing.')
      setStatus('error')
      return
    }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) { setErrorMsg(json.error ?? 'Something went wrong.'); setStatus('error'); return }
      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#00C48C1A' }}>
          <svg className="w-6 h-6" style={{ color: '#00C48C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Claim submitted</h3>
        <p className="text-sm text-gray-600 max-w-xs mx-auto">
          We will send a verification email within 24 hours. Expect a response within 1–2 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="claim-name" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input id="claim-name" name="name" type="text" required autoComplete="name" value={form.name} onChange={handleChange}
          placeholder="Ahmad Razali" disabled={status === 'submitting'}
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition" />
      </div>
      <div>
        <label htmlFor="claim-email" className="block text-sm font-medium text-gray-700 mb-1">
          Business Email <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input id="claim-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange}
          placeholder={`you@${providerName.toLowerCase().replace(/\s+/g, '').slice(0, 12)}.com.my`}
          disabled={status === 'submitting'}
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition" />
        <p className="text-xs text-gray-400 mt-1">Use your company email — it speeds up verification.</p>
      </div>
      <div>
        <label htmlFor="claim-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
        <input id="claim-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange}
          placeholder="+60 12-345 6789" disabled={status === 'submitting'}
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition" />
      </div>
      <div className="flex items-start gap-3 pt-1">
        <input id="claim-authorised" name="authorised" type="checkbox" checked={form.authorised} onChange={handleChange}
          disabled={status === 'submitting'} className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0" />
        <label htmlFor="claim-authorised" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
          I confirm I am authorised to manage the listing for <span className="font-medium">{providerName}</span>.
        </label>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5" role="alert">{errorMsg}</p>
      )}
      <button type="submit" disabled={status === 'submitting'}
        className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60"
        style={{ backgroundColor: '#0F6FEC', outlineColor: '#0F6FEC' }}>
        {status === 'submitting' ? 'Submitting claim…' : 'Submit Claim'}
      </button>
    </form>
  )
}
