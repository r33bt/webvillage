'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

const BUDGET_OPTIONS = [
  { value: '', label: 'Select budget range (optional)' },
  { value: 'Under RM 5,000', label: 'Under RM 5,000' },
  { value: 'RM 5,000 – 20,000', label: 'RM 5,000 – 20,000' },
  { value: 'RM 20,000 – 50,000', label: 'RM 20,000 – 50,000' },
  { value: 'RM 50,000+', label: 'RM 50,000+' },
  { value: 'To be discussed', label: 'To be discussed' },
]

interface Props {
  providerId: string
  providerName: string
}

export function EnquiryForm({ providerId, providerName }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    const headcountRaw = data.get('headcount') as string
    const headcount = headcountRaw && !isNaN(parseInt(headcountRaw, 10))
      ? parseInt(headcountRaw, 10)
      : undefined

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: providerId,
          enquirer_name: (data.get('enquirer_name') as string).trim(),
          enquirer_email: (data.get('enquirer_email') as string).trim(),
          enquirer_company: (data.get('enquirer_company') as string).trim() || undefined,
          training_need: (data.get('training_need') as string).trim(),
          headcount,
          budget_range: (data.get('budget_range') as string) || undefined,
          preferred_dates: (data.get('preferred_dates') as string).trim() || undefined,
          message: (data.get('message') as string).trim() || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#00C48C] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Enquiry sent</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {providerName} will be in touch within 2 business days. Check your inbox for a confirmation.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6FEC]/30 focus:border-[#0F6FEC] transition-colors'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Send an enquiry</h2>
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="eq-name" className="block text-xs font-medium text-gray-600 mb-1">
            Your name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="eq-name"
            name="enquirer_name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
            placeholder="Jane Lim"
          />
        </div>

        <div>
          <label htmlFor="eq-email" className="block text-xs font-medium text-gray-600 mb-1">
            Work email <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="eq-email"
            name="enquirer_email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="jane@company.com.my"
          />
        </div>

        <div>
          <label htmlFor="eq-company" className="block text-xs font-medium text-gray-600 mb-1">
            Company
          </label>
          <input
            id="eq-company"
            name="enquirer_company"
            type="text"
            autoComplete="organization"
            className={inputClass}
            placeholder="Acme Sdn Bhd"
          />
        </div>

        <div>
          <label htmlFor="eq-need" className="block text-xs font-medium text-gray-600 mb-1">
            Training need <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="eq-need"
            name="training_need"
            required
            rows={3}
            className={inputClass}
            placeholder="e.g. Sales skills training for 20 executives, HRDF claimable preferred"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="eq-headcount" className="block text-xs font-medium text-gray-600 mb-1">
              Headcount
            </label>
            <input
              id="eq-headcount"
              name="headcount"
              type="number"
              min={1}
              className={inputClass}
              placeholder="20"
            />
          </div>
          <div>
            <label htmlFor="eq-budget" className="block text-xs font-medium text-gray-600 mb-1">
              Budget
            </label>
            <select id="eq-budget" name="budget_range" className={inputClass}>
              {BUDGET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="eq-dates" className="block text-xs font-medium text-gray-600 mb-1">
            Preferred dates
          </label>
          <input
            id="eq-dates"
            name="preferred_dates"
            type="text"
            className={inputClass}
            placeholder="e.g. July 2026, flexible"
          />
        </div>

        <div>
          <label htmlFor="eq-message" className="block text-xs font-medium text-gray-600 mb-1">
            Additional notes
          </label>
          <textarea
            id="eq-message"
            name="message"
            rows={2}
            className={inputClass}
            placeholder="Anything else the provider should know"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#0F6FEC' }}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…</>
          ) : (
            <><Send className="w-4 h-4" aria-hidden="true" /> Send enquiry</>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          You will receive a confirmation email. No spam.
        </p>
      </form>
    </div>
  )
}
