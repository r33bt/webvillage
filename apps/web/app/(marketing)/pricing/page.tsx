'use client'

import { useState } from 'react'
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Mail,
  Globe,
  Shield,
  Star,
  ArrowRight,
  Wrench,
  FileText,
  PhoneCall,
  Database,
  Lock,
} from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@webvillage/ui'

// ---------------------------------------------------------------------------
// FAQ accordion
// ---------------------------------------------------------------------------

const FAQ_ITEMS = [
  {
    question: 'How long does migration take?',
    answer:
      'Starter migrations (up to 500 listings) typically take 5–10 business days. Professional migrations (up to 2,000 listings) take 10–20 business days. Enterprise timelines are scoped during onboarding.',
  },
  {
    question: 'What if I already have a directory?',
    answer:
      'We migrate your existing data — spreadsheets, WordPress exports, CSV files, or any structured format. No manual data entry on your end. Our team handles the full import and quality-checks every listing.',
  },
  {
    question: 'Can I keep my existing domain?',
    answer:
      'Yes. We support four domain scenarios: (1) Full turnkey — we register and manage your domain; (2) Existing domain via NS transfer — point your registrar to our nameservers; (3) Subdomain via CNAME — e.g. directory.yourassociation.org; (4) Manual DNS — you manage DNS, we provide the A/CNAME records.',
  },
  {
    question: "What's included in the setup fee?",
    answer:
      'The setup fee covers: data migration from your existing source, design configuration, full SEO setup (robots.txt, sitemap.xml, canonical tags, JSON-LD), professional email setup with included mailboxes, member claim flow activation, and a 1-hour onboarding call with handover documentation.',
  },
  {
    question: 'Do you offer a trial or demo?',
    answer:
      "Yes — book a 30-minute demo and we'll walk you through a live directory built with real association data. No slides, no pitch deck. You'll see exactly what your members will see.",
  },
  {
    question: 'How is this different from Wild Apricot or Brilliant Directories?',
    answer:
      "They sell you software to manage yourself. We manage it for you. No plugins to update, no hosting to worry about, no technical staff required on your side. You focus on your members; we keep the directory running, fast, and SEO-optimised.",
  },
]

// ---------------------------------------------------------------------------
// Managed Service plans
// ---------------------------------------------------------------------------

const MANAGED_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    setupFee: 2500,
    monthlyFee: 299,
    foundingSetup: 1500,
    listings: '500',
    email: '3 mailboxes (MXroute)',
    whiteLabel: false,
    recommended: false,
    features: [
      'Directory app on Vercel + SSL',
      'Domain setup (all 4 scenarios)',
      '3 professional email mailboxes',
      'Data migration from any source',
      'robots.txt, sitemap.xml, JSON-LD',
      'Member claim flow',
      'GDPR/PDPA-compliant handling',
      '1-hour onboarding call',
      'Handover documentation',
      '"Powered by WebVillage" badge',
    ],
    notIncluded: ['White-label (no badge)', 'API access', 'Multi-directory'],
  },
  {
    id: 'professional',
    name: 'Professional',
    setupFee: 5000,
    monthlyFee: 599,
    foundingSetup: 3000,
    listings: '2,000',
    email: '5 mailboxes (Google Workspace)',
    whiteLabel: false,
    recommended: true,
    features: [
      'Everything in Starter',
      '2,000 listings',
      '5 Google Workspace mailboxes',
      'Priority migration (10–20 days)',
      'Analytics dashboard',
      'Advanced search & filters',
      'Custom category taxonomy',
      'Member self-update portal',
      '"Powered by WebVillage" badge',
    ],
    notIncluded: ['White-label (no badge)', 'Multi-directory', 'Dedicated API'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    setupFee: 10000,
    monthlyFee: 999,
    foundingSetup: 6000,
    listings: 'Unlimited',
    email: '10 mailboxes (Google Workspace)',
    whiteLabel: true,
    recommended: false,
    features: [
      'Everything in Professional',
      'Unlimited listings',
      '10 Google Workspace mailboxes',
      'Full white-label (no WV badge)',
      'Multi-directory support',
      'REST API access',
      'Custom SLA',
      'Dedicated account manager',
      'Quarterly strategy reviews',
    ],
    notIncluded: [],
  },
]

// ---------------------------------------------------------------------------
// Self-serve plans
// ---------------------------------------------------------------------------

const SELF_SERVE_PLANS = [
  {
    name: 'Free',
    price: 0,
    listings: '50 listings',
    domain: 'webvillage.com/d/[slug]',
    branding: 'WV branded (required)',
    features: ['50 member listings', 'WebVillage subdomain', 'Basic search', 'SSL included'],
  },
  {
    name: 'Pro',
    price: 29,
    listings: 'Unlimited',
    domain: 'Custom domain',
    branding: 'Custom styling',
    features: ['Unlimited listings', 'Custom domain', 'Custom styling', 'Analytics', 'Priority support'],
    recommended: true,
  },
  {
    name: 'Business',
    price: 79,
    listings: 'Unlimited',
    domain: 'Custom domain',
    branding: 'Multi-directory, API, analytics',
    features: ['Everything in Pro', 'Multi-directory', 'REST API access', 'Advanced analytics', 'White-label option'],
  },
]

// ---------------------------------------------------------------------------
// What every client gets
// ---------------------------------------------------------------------------

const UNIVERSAL_FEATURES = [
  { icon: Globe, text: 'Directory app on Vercel with SSL' },
  { icon: Database, text: 'Data migration from your existing source' },
  { icon: Mail, text: 'Professional email setup with included mailboxes' },
  { icon: FileText, text: 'robots.txt, sitemap.xml, canonical tags, JSON-LD — SEO day 1' },
  { icon: Users, text: 'Member claim flow — self-serve listing management' },
  { icon: Lock, text: 'GDPR/PDPA-compliant data handling' },
  { icon: Shield, text: 'Domain setup (4 scenarios supported)' },
  { icon: PhoneCall, text: '1-hour onboarding call + handover documentation' },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 pb-16 pt-24 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
            <Building2 className="h-4 w-4" />
            Managed directory network for associations &amp; chambers
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Simple pricing for your member directory
          </h1>
          <p className="text-lg text-white/90 sm:text-xl">
            Done-for-you managed service. Or embed it yourself when self-serve launches.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Managed Service — PRIMARY                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative -mt-8 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-800">
              Available now
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">Managed Service</h2>
            <p className="mt-2 text-gray-500">
              We build, host, migrate, and manage your directory. You focus on your members.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {MANAGED_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.recommended
                    ? 'z-10 scale-105 border-2 border-indigo-600 shadow-xl'
                    : 'border border-gray-200 shadow-lg'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Founding Member badge */}
                {(plan.id === 'starter' || plan.id === 'professional') && (
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      Founding rate available
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.listings} listings</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* Pricing */}
                  <div className="mb-6 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.setupFee.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">one-time setup</p>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-bold text-indigo-600">${plan.monthlyFee}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    {(plan.id === 'starter' || plan.id === 'professional') && (
                      <p className="mt-1 text-xs font-medium text-amber-700">
                        Founding rate: ${plan.foundingSetup.toLocaleString()} setup
                      </p>
                    )}
                    {plan.id === 'enterprise' && (
                      <p className="mt-1 text-xs font-medium text-amber-700">
                        Founding rate: ${plan.foundingSetup.toLocaleString()}+ setup
                      </p>
                    )}
                  </div>

                  {/* Email included */}
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2">
                    <Mail className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                    <p className="text-sm font-medium text-indigo-900">{plan.email}</p>
                  </div>

                  {/* Included features */}
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <li key={`no-${idx}`} className="flex items-start gap-3">
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-300" />
                        <span className="text-sm text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4">
                  <a href="mailto:hello@webvillage.com" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.recommended ? 'default' : 'outline'}
                      size="lg"
                    >
                      Book a demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <p className="text-center text-xs text-gray-500">No commitment — 30-min call</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What every client gets                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Everything included on every managed plan
            </h2>
            <p className="mt-2 text-gray-500">No surprises. No add-ons required for a production-ready directory.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {UNIVERSAL_FEATURES.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                  <p className="text-sm font-medium text-gray-800">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Founding Member Programme                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-8 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-amber-900 sm:text-2xl">Founding Member Programme</h2>
              </div>
              <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-bold text-amber-900">
                5/5 slots available
              </span>
            </div>
            <p className="mb-6 text-amber-800">
              First 5 clients only. Lock in founding pricing forever and shape the product roadmap.
            </p>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-900">40% off setup fee</p>
                  <p className="text-sm text-amber-700">
                    Starter: $1,500 &nbsp;|&nbsp; Professional: $3,000 &nbsp;|&nbsp; Enterprise: $6,000+
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-900">Monthly rate locked forever</p>
                  <p className="text-sm text-amber-700">Never increases, even as we raise prices</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-900">Product input rights</p>
                  <p className="text-sm text-amber-700">Direct line to the roadmap — your priorities get built first</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-900">Named case study + testimonial</p>
                  <p className="text-sm text-amber-700">Prominent placement in the WebVillage network</p>
                </div>
              </div>
            </div>

            <a href="mailto:hello@webvillage.com?subject=Founding Member Programme" className="inline-block w-full sm:w-auto">
              <Button size="lg" className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto">
                Claim a founding slot
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <p className="mt-3 text-sm text-amber-700">
              Limited to the first 5 clients. Slots awarded in order of booking.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Self-Serve — Coming Soon                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-gray-200 px-4 py-1 text-sm font-semibold text-gray-600">
              Phase 2 — Coming soon
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">Self-Serve Plugin / Embed</h2>
            <p className="mt-2 text-gray-500">
              Want to embed WebVillage yourself? Join the waitlist for early access.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {SELF_SERVE_PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col opacity-80 ${
                  plan.recommended
                    ? 'border-2 border-indigo-400 shadow-md'
                    : 'border border-gray-200 shadow-sm'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-xl font-bold text-gray-700">{plan.name}</CardTitle>
                  <CardDescription>{plan.listings}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-4 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-bold text-gray-700">Free</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-gray-700">${plan.price}</span>
                          <span className="text-gray-400">/month</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg bg-gray-100 px-3 py-2">
                    <p className="text-center text-xs text-gray-500">Domain</p>
                    <p className="text-center text-sm font-medium text-gray-700">{plan.domain}</p>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <a
                    href="mailto:hello@webvillage.com?subject=Self-serve waitlist"
                    className="w-full"
                  >
                    <Button className="w-full" variant="outline" size="lg">
                      Join waitlist
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="flex min-h-[56px] w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <span className="pr-4 text-sm font-medium text-gray-900 sm:text-base">{item.question}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 sm:text-base">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Final CTA                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-3xl md:text-4xl">
            Ready to modernise your member directory?
          </h2>
          <p className="mb-6 px-2 text-base text-indigo-100 sm:mb-8 sm:text-xl">
            Book a 30-minute demo. We&apos;ll show it working with real association data.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4">
            <a href="mailto:hello@webvillage.com" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="min-h-[48px] w-full bg-white px-8 text-indigo-600 hover:bg-gray-100 sm:w-auto"
              >
                <PhoneCall className="mr-2 h-5 w-5" />
                Book a demo
              </Button>
            </a>
          </div>
          <div className="mt-6 flex flex-col flex-wrap items-center justify-center gap-3 text-sm text-indigo-100 sm:mt-8 sm:flex-row sm:gap-6 sm:text-base">
            <span className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              We handle setup end-to-end
            </span>
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Full data migration included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              GDPR &amp; PDPA compliant
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
