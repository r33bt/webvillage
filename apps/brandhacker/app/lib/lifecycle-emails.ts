/**
 * BrandHacker lifecycle email definitions.
 *
 * 8-email, 30-day sequence triggered from:
 *   - Day 0 (welcome): auth/callback after new tenant provisioning
 *   - Days 1–30:       /api/lifecycle/cron (daily at 08:00 UTC)
 *
 * Tracking: metadata.lifecycle.emails_sent[key] = ISO timestamp
 */

export const SEQUENCE: Array<{
  key: string
  day: number
  subject: (name: string) => string
  html: (data: EmailData) => string
}> = [
  {
    key: 'welcome',
    day: 0,
    subject: (name) => `You're live on BrandHacker, ${name}`,
    html: (d) => layout(`You're live, ${d.displayName}`, `
      <p style="${body}">Your brand substrate is set up. Here's what's active right now:</p>
      <ul style="${list}">
        <li style="${item}">Your <code style="${code}">/llms.txt</code> is serving your brand canon to AI crawlers</li>
        <li style="${item}">Your <code style="${code}">/.well-known/brand.json</code> is live with richer structured data</li>
        <li style="${item}">Every draft you generate is scored against your voice profile</li>
      </ul>
      <p style="${body}">The onboarding wizard walks you through voice, tokens, facts, and your first draft.</p>
      ${cta(d.dashboardUrl, 'Go to your dashboard')}
    `),
  },
  {
    key: 'day1',
    day: 1,
    subject: () => 'Your brand file is already answering questions',
    html: (d) => layout('Your /llms.txt is live', `
      <p style="${body}">AI crawlers (GPTBot, ClaudeBot, PerplexityBot) can now fetch your brand file directly. When they do, they get the version of you that you wrote — not a mismatched combination of your 2022 about page and a LinkedIn summary someone else wrote.</p>
      <p style="${body}">Check the live file to confirm it reflects your brand correctly.</p>
      ${cta(d.llmsTxtUrl, 'View your /llms.txt')}
      <p style="${secondary}">If anything is off, update your brand facts in the onboarding wizard — the file regenerates automatically.</p>
    `),
  },
  {
    key: 'day3',
    day: 3,
    subject: () => 'Which AI engines have found your brand',
    html: (d) => layout('Crawl activity: day 3', `
      <p style="${body}">By now, AI crawlers may have found your /llms.txt and brand.json. Your dashboard shows a count of how many times each file has been fetched and by which crawlers.</p>
      <p style="${body}">This is the crawl-frequency metric — a leading indicator that AI engines are indexing your brand canon. Citation quality (whether answers about you actually improve) takes longer to measure; we'll report that at 90 days.</p>
      ${cta(d.dashboardUrl, 'See your crawl activity')}
    `),
  },
  {
    key: 'day7',
    day: 7,
    subject: () => 'Two features worth exploring this week',
    html: (d) => layout("What's in your dashboard", `
      <p style="${body}">You've had BrandHacker for a week. Two features that go beyond the AEO surface:</p>
      <ul style="${list}">
        <li style="${item}"><strong>Content strategy</strong> — generate 3–5 brand pillars and 12+ topic stubs from your voice profile. Gives your calendar a foundation instead of a blank page.</li>
        <li style="${item}"><strong>Editorial calendar</strong> — see what's briefed, drafted, and published across your surfaces. The calendar reads from the same brand substrate as everything else.</li>
      </ul>
      ${cta(d.dashboardUrl, 'Explore the dashboard')}
    `),
  },
  {
    key: 'day15',
    day: 15,
    subject: () => 'Halfway through your trial — a quick check',
    html: (d) => layout('Day 15 of 30', `
      <p style="${body}">You're halfway through your free trial. A quick question: is BrandHacker doing the job you signed up for?</p>
      <ul style="${list}">
        <li style="${item}">If your AEO surface is set up and drafts are scoring well — you're in good shape. The case study that convinced you to try this is available at <a href="https://app.brandhacker.com/case-study/v22-multibrand" style="${link}">app.brandhacker.com/case-study/v22-multibrand</a> if you need to make the case internally.</li>
        <li style="${item}">If you haven't finished onboarding — the wizard takes about 10 minutes. Voice, tokens, facts, first draft. The AEO surface updates automatically after you save facts.</li>
      </ul>
      ${cta(d.dashboardUrl, 'Go to dashboard')}
      <p style="${secondary}">Reply to this email with any questions. This goes to a real inbox.</p>
    `),
  },
  {
    key: 'day25',
    day: 25,
    subject: () => 'Your trial ends in 5 days',
    html: (d) => layout('5 days left', `
      <p style="${body}">Your BrandHacker trial ends in 5 days. Here's what you'll keep if you upgrade:</p>
      <ul style="${list}">
        <li style="${item}">Your voice profile, templates, and brand facts — stay in the substrate</li>
        <li style="${item}">Your /llms.txt and brand.json — stay live and continue accumulating crawl data</li>
        <li style="${item}">Your draft history and scores — full audit trail of what your brand has published</li>
        <li style="${item}">Your editorial calendar — slots and strategy pillars remain</li>
      </ul>
      <p style="${body}"><strong>Starter: $99/month.</strong> One brand, 50 drafts/month, AEO monitoring, calendar.</p>
      ${cta(d.upgradeUrl, 'Upgrade to Starter')}
      <p style="${secondary}">Need Pro ($249/month) for publishing integration or multiple brands? Reply and we'll set it up directly.</p>
    `),
  },
  {
    key: 'day28',
    day: 28,
    subject: () => 'Trial ends in 2 days',
    html: (d) => layout('48 hours left', `
      <p style="${body}">Two days left on your trial. The shortest path to keeping everything running:</p>
      <ol style="${list}">
        <li style="${item}">Go to your dashboard</li>
        <li style="${item}">Click "Upgrade" — takes 60 seconds with a card</li>
        <li style="${item}">Nothing changes. Your brand substrate, AEO surface, and crawl monitoring all continue.</li>
      </ol>
      ${cta(d.upgradeUrl, 'Upgrade now — $99/month')}
      <p style="${secondary}">If price is the blocker, reply and tell me what's in the way. I'd rather understand the friction than lose you.</p>
    `),
  },
  {
    key: 'day30',
    day: 30,
    subject: () => 'Your trial ended — your data is safe',
    html: (d) => layout('Trial ended', `
      <p style="${body}">Your 30-day trial has ended. Your brand data — voice profile, facts, draft history, AEO artefacts — is all still in the system. Nothing is deleted.</p>
      <p style="${body}">Your /llms.txt and brand.json are paused (no longer regenerating on updates) but the files themselves remain accessible to AI crawlers.</p>
      <p style="${body}">If you want to pick back up, upgrade at any time and everything resumes exactly where you left off.</p>
      ${cta(d.upgradeUrl, 'Reactivate — $99/month')}
      <p style="${secondary}">If BrandHacker wasn't the right fit, I'd genuinely like to know why. Reply and tell me what didn't work.</p>
    `),
  },
]

// ---------------------------------------------------------------------------
// Email data shape
// ---------------------------------------------------------------------------

export type EmailData = {
  displayName: string
  dashboardUrl: string
  llmsTxtUrl: string
  upgradeUrl: string
  trialEndsAt?: string
}

// ---------------------------------------------------------------------------
// Minimal email-safe inline styles
// ---------------------------------------------------------------------------

const body = 'font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.65;color:#18181b;margin:0 0 16px 0;'
const secondary = 'font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.6;color:#71717a;margin:16px 0 0 0;'
const list = 'font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.65;color:#18181b;margin:0 0 16px 0;padding-left:20px;'
const item = 'margin-bottom:8px;'
const code = 'font-family:monospace;background:#f4f4f5;padding:1px 5px;border-radius:3px;font-size:13px;color:#18181b;'
const link = 'color:#6366f1;text-decoration:underline;'

function cta(href: string, label: string) {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#18181b;color:#fafafa;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:500;padding:10px 20px;border-radius:6px;text-decoration:none;">${label}</a></p>`
}

function layout(heading: string, content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#ffffff;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding-bottom:32px;border-bottom:1px solid #e4e4e7;">
          <p style="font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;margin:0;">BrandHacker</p>
        </td></tr>
        <tr><td style="padding-top:32px;">
          <h1 style="font-family:Inter,Arial,sans-serif;font-size:22px;font-weight:600;color:#18181b;margin:0 0 20px 0;line-height:1.3;">${heading}</h1>
          ${content}
        </td></tr>
        <tr><td style="padding-top:40px;border-top:1px solid #e4e4e7;margin-top:32px;">
          <p style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#a1a1aa;margin:0;line-height:1.6;">
            BrandHacker · <a href="https://app.brandhacker.com" style="color:#a1a1aa;">app.brandhacker.com</a>
            <br>You're receiving this because you signed up for a BrandHacker trial.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getEmailData(
  slug: string,
  displayName: string,
  trialEndsAt?: string,
): EmailData {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.brandhacker.com'
  return {
    displayName,
    dashboardUrl: `${base}/app`,
    llmsTxtUrl: `${base}/${slug}/llms.txt`,
    upgradeUrl: `${base}/waitlist`,
    trialEndsAt,
  }
}

export function getDaysSinceCreation(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function getEmailsSentMap(
  metadata: Record<string, unknown>,
): Record<string, string> {
  const lifecycle = metadata?.lifecycle as Record<string, unknown> | undefined
  return (lifecycle?.emails_sent ?? {}) as Record<string, string>
}

export function buildMetadataWithEmailSent(
  metadata: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const lifecycle = (metadata?.lifecycle as Record<string, unknown>) ?? {}
  const emailsSent = (lifecycle?.emails_sent as Record<string, string>) ?? {}
  return {
    ...metadata,
    lifecycle: {
      ...lifecycle,
      emails_sent: {
        ...emailsSent,
        [key]: new Date().toISOString(),
      },
    },
  }
}
