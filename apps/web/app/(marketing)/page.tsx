import { Check } from 'lucide-react'

// ─── Data ───────────────────────────────────────────────────────────────────

const painPoints = [
  {
    icon: '📋',
    quote:
      '"Our member directory is basically a spreadsheet we copied into a WordPress plugin. Half the entries are three years out of date."',
    attribution: '— Chamber of commerce executive',
  },
  {
    icon: '📱',
    quote:
      '"Members can\'t find anyone on their phone. The filters don\'t work, half the links are broken, and we haven\'t had budget to fix it."',
    attribution: '— Trade association operations director',
  },
  {
    icon: '🔧',
    quote:
      '"We pay a developer every quarter just to keep the directory plugin from breaking. It\'s not a feature — it\'s a liability."',
    attribution: '— Industry body administrator',
  },
]

const howItWorksSteps = [
  {
    number: '01',
    title: 'Migrate',
    body: 'We take your existing member data — spreadsheet, old CMS, or WordPress plugin — and build your new directory. No data entry on your end.',
    sub: 'Your spreadsheet → our hands',
  },
  {
    number: '02',
    title: 'Embed',
    body: 'Two lines of code on your existing website. Or use your new webvillage.com/d/[slug] page. Either way, it\'s live in days, not months.',
    sub: 'Works on any platform',
  },
  {
    number: '03',
    title: 'Grow',
    body: 'We handle new listing requests, updates, SEO content, and ongoing maintenance. Your members get found. You get time back.',
    sub: 'Zero ongoing admin',
  },
]

// Realistic mock listings for FindTraining
const findTrainingListings = [
  { name: 'Apex Training Sdn Bhd', category: 'Leadership & Management', location: 'Kuala Lumpur', price: 'RM 1,200/day', hrdf: true },
  { name: 'TechSkills Academy', category: 'IT & Digital', location: 'Petaling Jaya', price: 'RM 850/day', hrdf: true },
  { name: 'ProComm Institute', category: 'Communication', location: 'Penang', price: 'RM 950/day', hrdf: true },
  { name: 'SafeWork Malaysia', category: 'Safety & Compliance', location: 'Johor Bahru', price: 'RM 780/day', hrdf: true },
]

// Realistic mock listings for Cooperatives
const cooperativesListings = [
  { name: 'Koperasi Tenaga Nasional', category: 'Energy Sector', location: 'Kuala Lumpur', members: '12,400' },
  { name: 'Koperasi Guru Malaysia', category: 'Education', location: 'National', members: '86,200' },
  { name: 'Koperasi Pekerja Felda', category: 'Agriculture', location: 'Pahang', members: '8,900' },
  { name: 'Koperasi Wanita Selangor', category: 'Women\'s Development', location: 'Selangor', members: '3,100' },
]

const features = [
  {
    icon: '🗂',
    title: 'Fully Managed',
    body: 'We maintain your directory. New listings, updates, and fixes — handled by us, not your team.',
  },
  {
    icon: '🔍',
    title: 'SEO-Ready',
    body: 'Every listing is structured data. Google indexes your members individually, driving organic discovery.',
  },
  {
    icon: '📱',
    title: 'Mobile-First',
    body: 'Looks great on every device. Fast load times, no plugin maintenance, no WordPress updates.',
  },
  {
    icon: '🔌',
    title: 'Embed Anywhere',
    body: 'Two lines of code. Works on WordPress, Wix, Squarespace, Webflow, or plain HTML.',
  },
  {
    icon: '📊',
    title: 'Analytics',
    body: 'See which listings get the most views and clicks. Understand your member engagement.',
  },
  {
    icon: '🌐',
    title: 'Network Effect',
    body: 'Your listings appear on webvillage.com too — the cross-directory search hub growing every month.',
  },
]

const selfServeFeatures = {
  free: ['50 listings', 'webvillage.com/d/[slug]', 'WebVillage branded', 'Basic search & filters'],
  pro: ['Unlimited listings', 'Custom domain', 'Custom styling & colours', 'Multi-category support', 'Analytics dashboard'],
  business: ['Everything in Pro', 'Multiple directories', 'API access', 'Priority support', 'Remove WV branding'],
}

const managedFeatures = {
  starter: ['Up to 500 listings', 'Data migration from existing source', 'Basic SEO setup', 'Monthly update cycle', 'Email support'],
  professional: ['Up to 2,000 listings', 'Full data migration', 'SEO content (category pages)', 'Weekly update cycle', 'Dedicated account manager'],
  enterprise: ['Unlimited listings', 'Custom data pipeline', 'Full SEO programme', 'Daily operations', 'White-label option', 'SLA + dedicated manager'],
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0C1A18]">
        {/* Subtle teal radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(15,118,110,0.35) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center lg:px-8">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
            Your members deserve a directory
            <br className="hidden sm:block" />
            <span className="text-[#0F766E]"> that actually works.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-[#A8C4C0] sm:text-xl">
            Most association websites run a directory that&apos;s five years out of date,
            impossible to search, and breaks on mobile. We fix that — and maintain it for you.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:hello@webvillage.com"
              className="inline-flex items-center rounded-xl bg-[#D97706] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#B45309]"
            >
              Book a 30-min demo →
            </a>
            <a
              href="#live-proof"
              className="inline-flex items-center rounded-xl border border-white/20 px-8 py-4 text-lg font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              See a live example ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 2: Pain Recognition ─────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-14 text-center text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            Sound familiar?
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {painPoints.map((point) => (
              <div
                key={point.icon}
                className="rounded-2xl border border-[#E2ECEB] bg-white p-8 shadow-sm"
              >
                <div className="mb-5 text-3xl">{point.icon}</div>
                <p className="mb-4 text-base italic leading-relaxed text-[#1C2B28]">
                  {point.quote}
                </p>
                <p className="text-sm text-[#6B7C79]">{point.attribution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#F0FAF9] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            Three steps. Zero spreadsheets.
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-[#6B7C79]">
            From outdated directory to live, searchable, managed — in days.
          </p>

          <div className="grid gap-10 md:grid-cols-3">
            {howItWorksSteps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line — desktop only */}
                {i < howItWorksSteps.length - 1 && (
                  <div
                    className="absolute top-8 left-full hidden w-10 border-t-2 border-dashed border-[#0F766E]/30 md:block"
                    aria-hidden="true"
                  />
                )}
                <div className="mb-4 text-6xl font-bold text-[#0F766E]/10 leading-none">
                  {step.number}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-[#1C2B28]">{step.title}</h3>
                <p className="mb-3 text-[#6B7C79] leading-relaxed">{step.body}</p>
                <p className="text-sm font-medium text-[#0F766E]">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Live Proof ───────────────────────────────────────── */}
      <section id="live-proof" className="bg-[#0C1A18] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-white sm:text-4xl">
            See it in action
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-[#A8C4C0]">
            Two live WebVillage directories — real data, real organisations.
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* FindTraining */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">FindTraining.my</h3>
                  <p className="text-sm text-[#A8C4C0]">HRDF-accredited training providers</p>
                </div>
                <span className="rounded-full bg-[#0F766E]/30 px-3 py-1 text-xs font-medium text-[#5EEAD4]">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {findTrainingListings.map((listing) => (
                  <div
                    key={listing.name}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{listing.name}</p>
                      <p className="text-xs text-[#6B7C79]">
                        {listing.category} · {listing.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-[#D97706]">{listing.price}</p>
                      {listing.hrdf && (
                        <p className="text-xs text-[#6B7C79]">HRDF claimable</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <a
                  href="https://findtraining.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F766E] hover:text-[#5EEAD4] transition-colors"
                >
                  Visit FindTraining.my ↗
                </a>
              </div>
            </div>

            {/* Cooperatives */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Cooperatives.my</h3>
                  <p className="text-sm text-[#A8C4C0]">Malaysian cooperative societies</p>
                </div>
                <span className="rounded-full bg-[#0F766E]/30 px-3 py-1 text-xs font-medium text-[#5EEAD4]">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {cooperativesListings.map((listing) => (
                  <div
                    key={listing.name}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{listing.name}</p>
                      <p className="text-xs text-[#6B7C79]">
                        {listing.category} · {listing.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-[#D97706]">{listing.members}</p>
                      <p className="text-xs text-[#6B7C79]">members</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <a
                  href="https://cooperatives.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F766E] hover:text-[#5EEAD4] transition-colors"
                >
                  Visit Cooperatives.my ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Features ─────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            Everything your directory needs.
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-[#6B7C79]">
            Nothing it doesn&apos;t.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-[#F0FAF9] p-7"
              >
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-[#1C2B28]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B7C79]">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="bg-[#F8FAF9] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-[#6B7C79]">
            Self-serve if you want control. Managed if you want it done for you.
          </p>

          {/* Self-serve */}
          <div className="mb-8">
            <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-[#6B7C79]">
              Self-Serve — Add a directory to your existing site
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Free */}
              <div className="rounded-2xl border border-[#E2ECEB] bg-white p-8">
                <h4 className="mb-1 text-lg font-semibold text-[#1C2B28]">Free</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[#1C2B28]">$0</span>
                  <span className="text-[#6B7C79]">/mo</span>
                </div>
                <p className="mb-6 text-sm text-[#6B7C79]">Get started, no commitment</p>
                <ul className="mb-8 space-y-3">
                  {selfServeFeatures.free.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1C2B28]">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0F766E]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@webvillage.com"
                  className="block rounded-lg border border-[#0F766E] py-2.5 text-center text-sm font-semibold text-[#0F766E] transition-colors hover:bg-[#F0FAF9]"
                >
                  Get started
                </a>
              </div>

              {/* Pro */}
              <div className="rounded-2xl border-2 border-[#0F766E] bg-white p-8">
                <h4 className="mb-1 text-lg font-semibold text-[#1C2B28]">Pro</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[#1C2B28]">$29</span>
                  <span className="text-[#6B7C79]">/mo</span>
                </div>
                <p className="mb-6 text-sm text-[#6B7C79]">Unlimited listings, your domain</p>
                <ul className="mb-8 space-y-3">
                  {selfServeFeatures.pro.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1C2B28]">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0F766E]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@webvillage.com"
                  className="block rounded-lg bg-[#0F766E] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#0D6259]"
                >
                  Get started
                </a>
              </div>

              {/* Business */}
              <div className="rounded-2xl border border-[#E2ECEB] bg-white p-8">
                <h4 className="mb-1 text-lg font-semibold text-[#1C2B28]">Business</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[#1C2B28]">$79</span>
                  <span className="text-[#6B7C79]">/mo</span>
                </div>
                <p className="mb-6 text-sm text-[#6B7C79]">Multi-directory, API, analytics</p>
                <ul className="mb-8 space-y-3">
                  {selfServeFeatures.business.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1C2B28]">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0F766E]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@webvillage.com"
                  className="block rounded-lg border border-[#0F766E] py-2.5 text-center text-sm font-semibold text-[#0F766E] transition-colors hover:bg-[#F0FAF9]"
                >
                  Get started
                </a>
              </div>
            </div>
          </div>

          {/* Managed */}
          <div className="mt-14">
            <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-[#6B7C79]">
              Managed Service — We build it, fill it, and maintain it for you
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Starter */}
              <div className="rounded-2xl border border-[#E2ECEB] bg-white p-8">
                <h4 className="mb-1 text-lg font-semibold text-[#1C2B28]">Starter</h4>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-[#1C2B28]">$2,500</span>
                  <span className="text-sm text-[#6B7C79]"> setup</span>
                </div>
                <div className="mb-4 text-xl font-semibold text-[#1C2B28]">
                  + $299<span className="text-sm font-normal text-[#6B7C79]">/mo</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {managedFeatures.starter.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1C2B28]">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D97706]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@webvillage.com"
                  className="block rounded-lg border border-[#D97706] py-2.5 text-center text-sm font-semibold text-[#D97706] transition-colors hover:bg-amber-50"
                >
                  Book a demo
                </a>
              </div>

              {/* Professional */}
              <div className="relative rounded-2xl border-2 border-[#D97706] bg-white p-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D97706] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
                <h4 className="mb-1 text-lg font-semibold text-[#1C2B28]">Professional</h4>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-[#1C2B28]">$5,000</span>
                  <span className="text-sm text-[#6B7C79]"> setup</span>
                </div>
                <div className="mb-4 text-xl font-semibold text-[#1C2B28]">
                  + $599<span className="text-sm font-normal text-[#6B7C79]">/mo</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {managedFeatures.professional.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1C2B28]">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D97706]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@webvillage.com"
                  className="block rounded-lg bg-[#D97706] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#B45309]"
                >
                  Book a demo
                </a>
              </div>

              {/* Enterprise */}
              <div className="rounded-2xl border border-[#E2ECEB] bg-white p-8">
                <h4 className="mb-1 text-lg font-semibold text-[#1C2B28]">Enterprise</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#1C2B28]">Custom</span>
                </div>
                <p className="mb-4 text-sm text-[#6B7C79]">For large associations, federations, and agencies</p>
                <ul className="mb-8 space-y-3">
                  {managedFeatures.enterprise.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1C2B28]">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D97706]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@webvillage.com"
                  className="block rounded-lg border border-[#D97706] py-2.5 text-center text-sm font-semibold text-[#D97706] transition-colors hover:bg-amber-50"
                >
                  Contact us
                </a>
              </div>
            </div>

            {/* Founding member callout */}
            <div className="mt-8 rounded-xl border border-[#D97706]/30 bg-amber-50 p-6 text-center">
              <p className="text-sm text-[#1C2B28]">
                <span className="font-semibold">Are you one of our first 5 clients?</span>{' '}
                Ask about Founding Member pricing — 40% off your setup fee, monthly rate locked for life.{' '}
                <a href="mailto:hello@webvillage.com" className="font-semibold text-[#D97706] hover:text-[#B45309]">
                  Get in touch →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Embed / Plugin ────────────────────────────────────── */}
      <section id="embed" className="bg-[#0C1A18] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Left: Code block */}
            <div>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Embed on any website.
                <br />
                <span className="text-[#0F766E]">In two lines.</span>
              </h2>
              <p className="mb-8 text-[#A8C4C0]">
                Works on WordPress, Wix, Squarespace, Webflow, or plain HTML.
                No coding skills required.
              </p>

              <div className="rounded-xl bg-[#0A1210] border border-white/10 p-6 font-mono text-sm">
                <p className="mb-1 text-[#6B7C79]">{'<!-- Step 1: load once in <head> -->'}</p>
                <p className="mb-4">
                  <span className="text-[#5EEAD4]">{'<script'}</span>{' '}
                  <span className="text-[#D97706]">src</span>
                  <span className="text-white">{'="'}</span>
                  <span className="text-[#A8C4C0]">{'cdn.webvillage.com/embed/v1.js'}</span>
                  <span className="text-white">{'"'}</span>{' '}
                  <span className="text-[#D97706]">defer</span>
                  <span className="text-[#5EEAD4]">{'>'}</span>
                  <span className="text-[#5EEAD4]">{'</script>'}</span>
                </p>
                <p className="mb-1 text-[#6B7C79]">{'<!-- Step 2: place anywhere -->'}</p>
                <p>
                  <span className="text-[#5EEAD4]">{'<webvillage-directory'}</span>
                </p>
                <p className="ml-4">
                  <span className="text-[#D97706]">id</span>
                  <span className="text-white">{'="'}</span>
                  <span className="text-[#A8C4C0]">your-directory-slug</span>
                  <span className="text-white">{'"'}</span>
                </p>
                <p className="ml-4">
                  <span className="text-[#D97706]">theme</span>
                  <span className="text-white">{'="'}</span>
                  <span className="text-[#A8C4C0]">light</span>
                  <span className="text-white">{'"'}</span>
                </p>
                <p className="ml-4">
                  <span className="text-[#D97706]">show-search</span>
                  <span className="text-white">{'="'}</span>
                  <span className="text-[#A8C4C0]">true</span>
                  <span className="text-white">{'"'}</span>
                  <span className="text-[#5EEAD4]">{'>'}</span>
                </p>
                <p>
                  <span className="text-[#5EEAD4]">{'</webvillage-directory>'}</span>
                </p>
              </div>
            </div>

            {/* Right: Benefits */}
            <div className="space-y-6">
              {[
                {
                  title: 'Works on any platform',
                  body: 'WordPress, Squarespace, Wix, Webflow, plain HTML — the embed works everywhere. No plugin conflicts, no framework lock-in.',
                },
                {
                  title: 'Data stays on WebVillage',
                  body: "Nothing is installed on your server. Your directory is hosted and CDN-cached by us. You get the embed code; we handle the infrastructure.",
                },
                {
                  title: 'Update from your dashboard',
                  body: 'Make changes in the WebVillage dashboard — they appear on your embedded directory instantly. No redeploys, no developer required.',
                },
                {
                  title: 'WordPress plugin coming soon',
                  body: 'A native WordPress plugin (zero DB footprint, Gutenberg block + shortcode) is in development. Add your email for early access.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0F766E]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-[#A8C4C0]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Final CTA ─────────────────────────────────────────── */}
      <section className="bg-[#0F766E] py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="mb-5 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Ready to give your members a directory
            they&apos;ll actually use?
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-lg text-[#CCEDEA]">
            Book a free 30-minute call. We&apos;ll show you a live demo and tell
            you exactly what migration looks like for your organisation.
          </p>
          <a
            href="mailto:hello@webvillage.com"
            className="inline-flex items-center rounded-xl bg-[#D97706] px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#B45309]"
          >
            Book a 30-min demo →
          </a>
          <p className="mt-5 text-sm text-[#CCEDEA]/70">
            No commitment. No sales pressure.
          </p>
        </div>
      </section>

    </div>
  )
}
