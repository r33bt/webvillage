// app/dashboard/billing/page.tsx
// Server Component — Provider billing dashboard.
// Shows current plan, status, renewal date, and upgrade options.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, CheckCircle2, AlertCircle, ArrowUpCircle, Clock } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BillingCheckoutButton } from './BillingCheckoutButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

type Provider = {
  id: string
  name: string
  tier: 'free' | 'starter' | 'pro' | 'founding'
  subscription_status: string | null
  subscription_period_end: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function TierBadge({ tier }: { tier: Provider['tier'] }) {
  const styles: Record<Provider['tier'], string> = {
    free: 'bg-gray-100 text-gray-600 border-gray-200',
    founding: 'bg-amber-50 text-amber-700 border-amber-200',
    starter: 'bg-blue-50 text-blue-700 border-blue-200',
    pro: 'bg-teal-50 text-teal-700 border-teal-200',
  }
  const labels: Record<Provider['tier'], string> = {
    free: 'Free',
    founding: 'Founding Member',
    starter: 'Starter',
    pro: 'Pro',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[tier]}`}
    >
      {labels[tier]}
    </span>
  )
}

export default async function DashboardBillingPage({
  searchParams,
}: {
  searchParams: { success?: string }
}) {
  const supabase = await createSupabaseServerClient()

  // Auth guard
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch provider claimed by this user
  const { data: provider, error: providerError } = await supabase
    .from('ft_providers')
    .select('id, name, tier, subscription_status, subscription_period_end')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/billing] provider fetch error:', providerError.message)
  }

  const isSuccess = searchParams.success === '1'
  const tier = (provider?.tier ?? 'free') as Provider['tier']
  const renewalDate = formatDate(provider?.subscription_period_end ?? null)

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <nav
          className="text-xs text-gray-500 mb-8 flex items-center gap-1.5"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard/profile" className="hover:text-gray-700">
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Billing</span>
        </nav>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-8">
          <div
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: '#0F6FEC1A' }}
          >
            <CreditCard
              className="w-6 h-6"
              style={{ color: '#0F6FEC' }}
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Billing &amp; Plan</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your FindTraining subscription</p>
          </div>
        </div>

        {/* ── Success banner ─────────────────────────────────────── */}
        {isSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-green-900">Payment successful!</p>
              <p className="text-sm text-green-800 mt-0.5">
                Your plan has been upgraded. It may take a moment for your dashboard to reflect the
                change.
              </p>
            </div>
          </div>
        )}

        {/* ── No provider ─────────────────────────────────────────── */}
        {!provider && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-base font-semibold text-amber-900 mb-1">
                  No profile claimed yet
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  Claim your provider listing before managing billing.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0F6FEC' }}
                >
                  Browse providers
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Current plan card ─────────────────────────────────── */}
        {provider && (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Current Plan</h2>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TierBadge tier={tier} />
                    {provider.subscription_status === 'active' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Active
                      </span>
                    )}
                    {provider.subscription_status === 'past_due' && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        Payment overdue
                      </span>
                    )}
                    {provider.subscription_status === 'canceled' && (
                      <span className="text-xs text-gray-500 font-medium">Canceled</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {provider.name}
                  </p>
                </div>

                {tier === 'pro' && (
                  <span
                    className="text-lg font-bold"
                    style={{ color: '#0F6FEC' }}
                  >
                    RM 800<span className="text-sm font-normal text-gray-400">/mo</span>
                  </span>
                )}
                {tier === 'starter' && (
                  <span
                    className="text-lg font-bold"
                    style={{ color: '#0F6FEC' }}
                  >
                    RM 300<span className="text-sm font-normal text-gray-400">/mo</span>
                  </span>
                )}
                {tier === 'founding' && (
                  <span
                    className="text-lg font-bold"
                    style={{ color: '#0F6FEC' }}
                  >
                    RM 100<span className="text-sm font-normal text-gray-400">/mo</span>
                  </span>
                )}
              </div>

              {renewalDate && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Renews on {renewalDate}</span>
                </div>
              )}

              {tier === 'founding' && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  Your Founding Member rate of RM 100/mo is valid for your first 3 months. At Month 4,
                  your plan converts to Starter (RM 300/mo).
                </div>
              )}
            </div>

            {/* ── Upgrade options ───────────────────────────────────── */}
            {(tier === 'free' || tier === 'founding') && (
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Starter card */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Starter
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      RM 300
                      <span className="text-sm font-normal text-gray-500">/mo</span>
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Claimed &amp; verified listing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Logo &amp; full profile
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Appear in search results
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Contact click tracking
                    </li>
                  </ul>
                  <BillingCheckoutButton plan="starter" label="Upgrade to Starter" />
                </div>

                {/* Pro card */}
                <div
                  className="bg-white rounded-2xl border-2 p-6 flex flex-col"
                  style={{ borderColor: '#0F6FEC' }}
                >
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#0F6FEC' }}>
                      Pro — Most Popular
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      RM 800
                      <span className="text-sm font-normal text-gray-500">/mo</span>
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Everything in Starter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Priority search placement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Featured category listings
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                      Analytics dashboard
                    </li>
                  </ul>
                  <BillingCheckoutButton plan="pro" label="Upgrade to Pro" primary />
                </div>
              </div>
            )}

            {/* Starter → Pro upgrade */}
            {tier === 'starter' && (
              <div
                className="bg-white rounded-2xl border-2 p-6 mb-6"
                style={{ borderColor: '#0F6FEC' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpCircle className="w-5 h-5" style={{ color: '#0F6FEC' }} aria-hidden="true" />
                      <h3 className="text-base font-semibold text-gray-900">Upgrade to Pro</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Get priority placement, featured category listings, and an analytics dashboard.
                      RM 800/mo.
                    </p>
                    <BillingCheckoutButton plan="pro" label="Upgrade to Pro" primary />
                  </div>
                </div>
              </div>
            )}

            {/* Pro — current plan */}
            {tier === 'pro' && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm font-medium text-teal-900">
                  You&apos;re on the Pro plan — the highest tier available.
                </p>
              </div>
            )}

            {/* Support link */}
            <p className="text-xs text-gray-400 mt-6 text-center">
              Questions about your plan?{' '}
              <a
                href="mailto:hello@findtraining.com"
                className="underline hover:text-gray-600"
              >
                Contact support
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
