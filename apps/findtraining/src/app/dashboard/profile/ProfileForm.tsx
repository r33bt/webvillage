'use client'

import { useTransition, useState } from 'react'
import type { DeliveryMethod } from '@webvillage/engine/types/ft'

// ---------------------------------------------------------------------------
// Malaysian states list
// ---------------------------------------------------------------------------
const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'WP Kuala Lumpur',
  'WP Labuan',
  'WP Putrajaya',
]

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: 'in-person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual / Online Live' },
  { value: 'e-learning', label: 'E-Learning (Self-Paced)' },
  { value: 'hybrid', label: 'Hybrid' },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ProfileFormProps {
  provider: {
    name: string
    description: string | null
    logo_url: string | null
    website: string | null
    email: string | null
    phone: string | null
    address?: string | null
    state: string | null
    delivery_methods: DeliveryMethod[]
  }
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ProfileForm({ provider }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    name: provider.name ?? '',
    description: provider.description ?? '',
    logo_url: provider.logo_url ?? '',
    website: provider.website ?? '',
    email: provider.email ?? '',
    phone: provider.phone ?? '',
    address: (provider as { address?: string | null }).address ?? '',
    state: provider.state ?? '',
    delivery_methods: provider.delivery_methods ?? ([] as DeliveryMethod[]),
  })

  function handleText(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleDelivery(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, checked } = e.target
    setForm((prev) => ({
      ...prev,
      delivery_methods: checked
        ? [...prev.delivery_methods, value as DeliveryMethod]
        : prev.delivery_methods.filter((m) => m !== value),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus('saving')
    setErrorMsg('')

    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            logo_url: form.logo_url.trim() || null,
            website: form.website.trim() || null,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            address: form.address.trim() || null,
            state: form.state || null,
            delivery_methods: form.delivery_methods,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          setErrorMsg(json.error ?? 'Something went wrong.')
          setSaveStatus('error')
          return
        }
        setSaveStatus('saved')
        // Reset "saved" indicator after 3s
        setTimeout(() => setSaveStatus('idle'), 3000)
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
      {/* ── Company Name ──────────────────────────────────────────── */}
      <div>
        <label htmlFor="pf-name" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="pf-name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleText}
          disabled={isDisabled}
          className={inputClass}
        />
      </div>

      {/* ── Description ───────────────────────────────────────────── */}
      <div>
        <label htmlFor="pf-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="pf-description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleText}
          disabled={isDisabled}
          placeholder="Briefly describe your training services, specialisations, and target audience."
          className={inputClass + ' resize-y'}
        />
        <p className="text-xs text-gray-400 mt-1">Shown on your public profile page.</p>
      </div>

      {/* ── Logo URL ──────────────────────────────────────────────── */}
      <div>
        <label htmlFor="pf-logo-url" className="block text-sm font-medium text-gray-700 mb-1">
          Logo URL
        </label>
        <input
          id="pf-logo-url"
          name="logo_url"
          type="url"
          value={form.logo_url}
          onChange={handleText}
          disabled={isDisabled}
          placeholder="https://example.com/logo.png"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          Direct link to your logo (PNG or SVG, square preferred). Logo upload coming soon.
        </p>
      </div>

      {/* ── Contact details grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            id="pf-website"
            name="website"
            type="url"
            value={form.website}
            onChange={handleText}
            disabled={isDisabled}
            placeholder="https://yourcompany.com.my"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="pf-email" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            id="pf-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleText}
            disabled={isDisabled}
            placeholder="training@company.com.my"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="pf-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            id="pf-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleText}
            disabled={isDisabled}
            placeholder="+60 3-1234 5678"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="pf-state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            id="pf-state"
            name="state"
            value={form.state}
            onChange={handleText}
            disabled={isDisabled}
            className={inputClass}
          >
            <option value="">— Select state —</option>
            {MALAYSIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Address ───────────────────────────────────────────────── */}
      <div>
        <label htmlFor="pf-address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          id="pf-address"
          name="address"
          type="text"
          value={form.address}
          onChange={handleText}
          disabled={isDisabled}
          placeholder="Jalan Example, 50000 Kuala Lumpur"
          className={inputClass}
        />
      </div>

      {/* ── Delivery Methods ──────────────────────────────────────── */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Methods
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DELIVERY_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="checkbox"
                value={value}
                checked={form.delivery_methods.includes(value)}
                onChange={handleDelivery}
                disabled={isDisabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Error / Success feedback ──────────────────────────────── */}
      {saveStatus === 'error' && errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5" role="alert">
          {errorMsg}
        </p>
      )}
      {saveStatus === 'saved' && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2.5" role="status">
          Profile saved successfully.
        </p>
      )}

      {/* ── Submit ────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#0F6FEC', outlineColor: '#0F6FEC' }}
      >
        {isDisabled ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}
