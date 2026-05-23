// Welcome email sequence for newly-paid founding / starter / pro providers.
// Three touches: Day 0 (sent inline from Stripe webhook), Day 3, Day 7.
// Day 3 + Day 7 require a scheduled cron — see /api/cron/welcome-followup route
// + REV-P3-3 cron wiring note in 211-findtraining/backlog.md.

import { Resend } from 'resend'

const FROM = 'FindTraining <hello@findtraining.com>'

export interface WelcomeRecipient {
  email: string
  name: string
  company_name: string
  tier: 'founding' | 'starter' | 'pro'
  dashboard_url?: string
}

const DEFAULT_DASHBOARD_URL = 'https://findtraining.com/dashboard'

function tierLabel(tier: WelcomeRecipient['tier']): string {
  if (tier === 'founding') return 'Founding Member'
  if (tier === 'starter') return 'Starter'
  return 'Pro'
}

// ---------------------------------------------------------------------------
// Day 0 — sent at the moment the Stripe payment succeeds.
// Confirms the payment, points to the dashboard, sets expectations.
// ---------------------------------------------------------------------------

export function buildDay0(r: WelcomeRecipient) {
  const dashboard = r.dashboard_url ?? DEFAULT_DASHBOARD_URL
  return {
    subject: `${r.company_name} is now live on FindTraining — your first steps`,
    text: [
      `Hi ${r.name},`,
      '',
      `Payment received. ${r.company_name} is now a ${tierLabel(r.tier)} on FindTraining.`,
      '',
      r.tier === 'founding'
        ? 'You are locked in at RM 100/mo for life — that rate never moves up on you.'
        : `You are on the ${tierLabel(r.tier)} plan. Manage billing any time from the dashboard.`,
      '',
      'Your first three jobs, in order:',
      '',
      '1. Sign in to your dashboard (magic link below) and finish your profile — description, logo, contact details, HRDF number.',
      '2. Add your courses. Up to 5 on Founding/Starter, unlimited on Pro. Courses are what HR managers see when they filter by category.',
      '3. Watch the leads inbox for the first 1–2 weeks. Most categories start producing enquiries within that window once Google re-indexes your updated profile.',
      '',
      `Dashboard: ${dashboard}`,
      '',
      'Magic link is sent separately — check your inbox for "Sign in to FindTraining".',
      '',
      'What to expect in the first 7 days:',
      '  Day 0  Profile goes live within minutes of you saving your changes.',
      '  Day 1–2  Google re-indexes your updated profile. Search traffic starts.',
      '  Day 3+  Profile views appear in analytics. First enquiries land within the next 1–2 weeks for active categories.',
      '',
      'Reply to this email any time. Real human, real reply.',
      '',
      'Patrick',
      'Founder, FindTraining.com',
    ].join('\n'),
  }
}

// ---------------------------------------------------------------------------
// Day 3 — sent 72h after payment if the provider hasn't logged in yet
// (or hasn't completed profile basics). Gentle nudge.
// ---------------------------------------------------------------------------

export function buildDay3(r: WelcomeRecipient) {
  const dashboard = r.dashboard_url ?? DEFAULT_DASHBOARD_URL
  return {
    subject: `${r.company_name} on FindTraining — quick nudge`,
    text: [
      `Hi ${r.name},`,
      '',
      `Three days since ${r.company_name} went live. A small check-in.`,
      '',
      'If you haven\'t already, the two things that move the needle most are:',
      '',
      '  - A real description (3–4 sentences about who you train and the outcomes you deliver — not a generic bio).',
      '  - At least 1 course or service listed. Courses are what HR managers filter on. A profile with 0 courses is invisible to category-search buyers.',
      '',
      `Dashboard: ${dashboard}`,
      '',
      'No views yet? Normal. Google indexing typically takes 24–48h from your last profile edit. If you saved your changes yesterday, expect search traffic to start landing today or tomorrow.',
      '',
      'Anything blocking you? Reply to this email and I will help directly.',
      '',
      'Patrick',
      'Founder, FindTraining.com',
    ].join('\n'),
  }
}

// ---------------------------------------------------------------------------
// Day 7 — week-one wrap. Reports basic stats if available; opens the
// feedback channel; re-states the cancellation guarantee for founding tier.
// ---------------------------------------------------------------------------

export function buildDay7(r: WelcomeRecipient & { views_7d?: number; enquiries_7d?: number }) {
  const dashboard = r.dashboard_url ?? DEFAULT_DASHBOARD_URL
  const lines: string[] = [
    `Hi ${r.name},`,
    '',
    `One week since ${r.company_name} joined FindTraining. Here's where things stand.`,
    '',
  ]

  if (typeof r.views_7d === 'number' || typeof r.enquiries_7d === 'number') {
    lines.push('Your first 7 days:')
    if (typeof r.views_7d === 'number') {
      lines.push(`  - Profile views: ${r.views_7d}`)
    }
    if (typeof r.enquiries_7d === 'number') {
      lines.push(`  - Enquiries received: ${r.enquiries_7d}`)
    }
    lines.push('')
  }

  lines.push(
    'A few things that help conversion now that traffic is flowing:',
    '',
    '  - Specific course titles outperform generic ones. "HRDF-Claimable Advanced Excel for Finance Teams (2-day)" beats "Excel Training".',
    '  - Add a phone number on your profile. HR managers comparing 3 providers tend to call the one with the lowest friction.',
    '  - If you have HRDF-verified status, make sure it is set on your profile so the badge shows on your public listing.',
    '',
    `Dashboard: ${dashboard}`,
    '',
  )

  if (r.tier === 'founding') {
    lines.push(
      'Reminder: the 7-day refund window for founding members closes today. If FindTraining is not the right fit, reply to this email and I\'ll process a full refund — no questions, no friction.',
      '',
      'Otherwise, the RM 100/mo locked-for-life rate continues. No surprises.',
      '',
    )
  }

  lines.push(
    'Honest question: what is the single thing about the dashboard or the public profile that has annoyed you most this week?',
    '',
    'Reply with one line. I read every response and the directory gets better because of them.',
    '',
    'Patrick',
    'Founder, FindTraining.com',
  )

  return {
    subject: `${r.company_name} — your first week on FindTraining`,
    text: lines.join('\n'),
  }
}

// ---------------------------------------------------------------------------
// Sender — thin wrapper around resend.emails.send so callers don't repeat
// the API key + from + error-swallow pattern.
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(
  to: string,
  message: { subject: string; text: string },
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM,
      to,
      subject: message.subject,
      text: message.text,
    })
    return { ok: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown send error'
    return { ok: false, error }
  }
}
