// app/dashboard/page.tsx
// Dashboard overview — tier badge, founding member callout, quick actions.
// Server Component. Auth guard is also in the parent layout; double-guarding here
// for page-level redirects in case layout cache misses.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, BookOpen, Inbox, ArrowRight, Star, TrendingUp, CreditCard } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Tier } from '@webvillage/engine/types/ft'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Overview | FindTraining',
  robots: { index: false, follow: false },
}

// ---------------------------------------------------------------------------
// Tier badge config
// ---------------------------------------------------------------------------

interface TierBadgeConfig {
  label: string
  bgColor: string
  textColor: string
  borderColor: string
  tagline: string
}

const TIER_BADGE: Record<Tier, TierBadgeConfig> = {
  founding: {
    label: 'Founding Member',
    bgColor: '#FFF8E7',
    textColor: '#92600A',
    borderColor: '#F6C94B',
    tagline: 'Founding member — converts to Starter at Month 4',
  },
  starter: {
    label: 'Starter',
    bgColor: '#EFF6FF',
    textColor: '#1D4ED8',
    borderColor: '#BFDBFE',
    tagline: 'Starter listing — enhanced visibility and contact details',
  },
  pro: {
    label: 'Pro',
    bgColor: '#F5F3FF',
    textColor: '#6D28D9',
    borderColor: '#DDD6FE',
    tagline: 'Pro listing — maximum visibility, analytics, and priority support',
  },
  free: {
    label: 'Free',
    bgColor: '#F9FAFB',
    textColor: '#6B7280',
    borderColor: '#E5E7EB',
    tagline: 'Free listing — basic directory presence',
  },
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function TierBadge({ tier }: { tier: Tier }) {
  const config = TIER_BADGE[tier] ?? TIER_BADGE.free
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor,
      }}
    >
      {tier === 'founding' && (
        <Star className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      )}
      {config.label}
    </span>
  )
}

const QUICK_LINKS = [
  {
    href: '/dashboard/profile',
    icon: GraduationCap,
    label: 'Complete your profile',
    description: 'Add your company logo, description, and contact details.',
  },
  {
    href: '/dashboard/courses',
    icon: BookOpen,
    label: 'Add your courses',
    description: 'List the training courses and programmes you offer.',
  },
  {
    href: '/dashboard/leads',
    icon: Inbox,
    label: 'View leads',
    description: 'See enquiries from companies looking for training.',
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const email = user.email ?? ''
  const firstName = email.split('@')[0]

  // Fetch provider linked to this user
  const { data: provider } = await supabase
    .from('ft_providers')
    .select('id, name, slug, tier, profile_status')
    .eq('claimed_by', user.id)
    .maybeSingle()

  const tier: Tier = (provider?.tier as Tier) ?? 'free'
  const badgeConfig = TIER_BADGE[tier] ?? TIER_BADGE.free

  return (
    <div>
      {/* ── Greeting + tier badge ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-sm text-gray-500">
            Manage your FindTraining provider profile from here.
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <TierBadge tier={tier} />
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs">{badgeConfig.tagline}</p>
        </div>
      </div>

      {/* ── Founding member callout ─────────────────────────────────────── */}
      {tier === 'founding' && (
        <div
          className="rounded-xl border p-5 mb-6 flex items-start gap-4"
          style={{ backgroundColor: '#FFF8E7', borderColor: '#F6C94B' }}
        >
          <Star
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: '#92600A' }}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#92600A' }}>
              Founding Member
            </p>
            <p className="text-sm mt-0.5 leading-relaxed" style={{ color: '#78500A' }}>
              You are locked in at RM&nbsp;100/mo for your first 3 months. At Month 4 your
              listing automatically converts to Starter (RM&nbsp;300/mo) — no action needed from
              you.
            </p>
          </div>
        </div>
      )}

      {/* ── Upgrade CTA (free tier only) ────────────────────────────────── */}
      {tier === 'free' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <TrendingUp
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-blue-900">Upgrade your listing</p>
              <p className="text-sm text-blue-700 mt-0.5 leading-relaxed">
                Get top placement, a verified badge, and your contact details visible to HR managers.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0F6FEC' }}
          >
            <CreditCard className="w-4 h-4" aria-hidden="true" />
            Upgrade
          </Link>
        </div>
      )}

      {/* ── Quick stats — placeholders ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Profile views', value: '—', note: 'View analytics →' },
          { label: 'Course listings', value: '0', note: 'No courses added yet' },
          { label: 'New leads', value: '0', note: 'No leads yet' },
        ].map(({ label, value, note }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-0.5">{value}</p>
            <p className="text-xs text-gray-400">{note}</p>
          </div>
        ))}
      </div>

      {/* ── Quick links ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Get started
        </h2>
        <div className="space-y-3">
          {QUICK_LINKS.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-[#0F6FEC] hover:shadow-sm transition-all group"
            >
              <div
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: '#0F6FEC1A' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#0F6FEC' }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <ArrowRight
                className="w-4 h-4 text-gray-300 group-hover:text-[#0F6FEC] transition-colors flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
