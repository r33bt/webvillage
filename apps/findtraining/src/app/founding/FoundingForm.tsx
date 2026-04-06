'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FormState {
  company_name: string
  name: string
  email: string
  phone: string
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const FAQS = [
  {
    q: 'When do I pay?',
    a: 'After we confirm your slot and before launch. We will send you a payment link — no money changes hands until we personally review your application.',
  },
  {
    q: 'What if I am not happy?',
    a: 'Full refund within 7 days of your first payment. No questions asked.',
  },
  {
    q: 'What is HRDF levy?',
    a: "HRDF (Human Resources Development Fund), now managed by HRD Corp, is a mandatory levy paid by employers in Malaysia. Companies contribute 1% of monthly payroll. This levy can be claimed back to fund training from registered providers — making HRDF-registered training effectively free for employers.",
  },
  {
    q: 'Is this different from eTRiS?',
    a: "Yes. eTRiS is HRD Corp's system for tracking grant claims — it's for HR managers who already know their provider. FindTraining is for discovery: helping HR managers find the right provider by topic, state, and delivery method.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-gray-900 hover:text-blue-700 transition-colors focus:outline-none"
        aria-expanded={open}
      >
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-4 text-gray-400" />}
      </button>
      {open && <p className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  )
}

export function FaqSection() {
  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-6">
      {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
    </div>
  )
}

export function FoundingFormCard({ foundingCount, totalSlots }: { foundingCount: number; totalSlots: number }) {
  const [form, setForm] = useState<FormState>({ company_name: '', name: '', email: '', phone: '' })
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/founding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: '#00C48C1A' }}>
          <svg className="w-7 h-7" style={{ color: '#00C48C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re on the list</h3>
        <p className="text-sm text-gray-600">We&apos;ll be in touch within 48 hours to confirm your founding slot and next steps.</p>
      </div>
    )
  }

  const slotsLeft = totalSlots - foundingCount

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-amber-600 mb-1">{slotsLeft} of {totalSlots} founding slots remaining</p>
        <h2 className="text-xl font-bold text-gray-900">Reserve Your Founding Slot</h2>
        <p className="text-sm text-gray-500 mt-1">RM 100/mo locked for life — no payment until confirmed</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="f-company" className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500" aria-hidden="true">*</span></label>
          <input id="f-company" name="company_name" type="text" required value={form.company_name} onChange={handleChange}
            placeholder="Acme Training Sdn Bhd" disabled={status === 'submitting'}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition" />
        </div>
        <div>
          <label htmlFor="f-name" className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500" aria-hidden="true">*</span></label>
          <input id="f-name" name="name" type="text" required value={form.name} onChange={handleChange}
            placeholder="Ahmad Razali" disabled={status === 'submitting'}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition" />
        </div>
        <div>
          <label htmlFor="f-email" className="block text-sm font-medium text-gray-700 mb-1">Business Email <span className="text-red-500" aria-hidden="true">*</span></label>
          <input id="f-email" name="email" type="email" required value={form.email} onChange={handleChange}
            placeholder="you@company.com.my" disabled={status === 'submitting'}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition" />
        </div>
        <div>
          <label htmlFor="f-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
          <input id="f-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
            placeholder="+60 12-345 6789" disabled={status === 'submitting'}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition" />
        </div>
        {status === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5" role="alert">{errorMsg}</p>
        )}
        <button type="submit" disabled={status === 'submitting'}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60"
          style={{ backgroundColor: '#0F6FEC', outlineColor: '#0F6FEC' }}>
          {status === 'submitting' ? 'Reserving your slot…' : 'Reserve My Founding Slot'}
        </button>
        <p className="text-xs text-gray-400 text-center">No payment until we confirm your slot. Full refund within 7 days.</p>
      </form>
    </div>
  )
}
