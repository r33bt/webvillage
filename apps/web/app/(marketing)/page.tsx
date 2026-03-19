'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Globe,
  Mail,
  Zap,
  Shield,
  BarChart,
  ChevronRight,
  Link as LinkIcon,
  Calendar,
  AtSign,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@webvillage/ui'

// Template data for showcase
const templates = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'Personal',
    description: 'Clean, professional portfolio',
  },
  {
    id: 'consultant',
    name: 'Consultant',
    category: 'Business',
    description: 'Perfect for coaches & consultants',
  },
  {
    id: 'startup',
    name: 'Startup',
    category: 'Business',
    description: 'Modern SaaS landing page',
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'Portfolio',
    description: 'Bold design for artists',
  },
  {
    id: 'local-business',
    name: 'Local Business',
    category: 'Business',
    description: 'Great for shops & restaurants',
  },
  {
    id: 'link-in-bio',
    name: 'Link in Bio',
    category: 'Creator',
    description: 'Perfect for social creators',
  },
]

// Value proposition features — emphasize tool replacement
const features = [
  {
    icon: Zap,
    title: 'Launch in Minutes',
    description:
      'Pick a template, add your content, and go live. No coding required.',
  },
  {
    icon: Globe,
    title: 'Custom Domains — included, not extra',
    description:
      'Get your custom domain and fast, secure hosting all in one place. No separate registrar needed.',
  },
  {
    icon: Mail,
    title: 'Professional Email — from $3/mo, not $6',
    description:
      'Add yourname@yourdomain.com. Half the cost of buying separately.',
  },
  {
    icon: Calendar,
    title: 'Built-in Booking — No Calendly needed',
    description:
      'Let clients book appointments directly from your site. No third-party scheduling tool required.',
  },
  {
    icon: LinkIcon,
    title: 'Link-in-Bio — No Linktree needed',
    description:
      'A beautiful link page built into your site. One platform instead of two.',
  },
  {
    icon: BarChart,
    title: 'Built-in Analytics',
    description:
      'Track visitors, understand your audience, and grow your presence. No extra analytics subscription.',
  },
]

// Tools that WebVillage replaces
const replacedTools = [
  { name: 'Linktree', cost: 9, icon: LinkIcon },
  { name: 'Wix', cost: 16, icon: Globe },
  { name: 'Calendly', cost: 10, icon: Calendar },
  { name: 'Domain', cost: 1, icon: AtSign },
  { name: 'Email', cost: 6, icon: Mail },
]

const totalToolsCost = replacedTools.reduce((sum, t) => sum + t.cost, 0)
const webVillageProCost = 19
const savings = totalToolsCost - webVillageProCost
const savingsPercent = Math.round((savings / totalToolsCost) * 100)

// Real technology partners powering the platform
const techPartners = [
  {
    name: 'Vercel',
    role: 'Hosting & Edge Network',
    description:
      "Every site deploys to Vercel's global edge network for fast load times worldwide.",
  },
  {
    name: 'Stripe',
    role: 'Payments',
    description:
      'Secure payment processing trusted by millions of businesses globally.',
  },
  {
    name: 'Cloudflare',
    role: 'DNS & Security',
    description:
      'Enterprise-grade DNS, DDoS protection, and SSL certificates on every site.',
  },
]

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) return
    setEmailStatus('loading')
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed.split('@')[0],
          email: trimmed,
          source_domain: 'webvillage.com',
          subject: 'waitlist',
          utm_source: 'landing-page',
        }),
      })
      if (res.ok) setEmailStatus('success')
      else setEmailStatus('error')
    } catch {
      setEmailStatus('error')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/4 -top-1/2 h-64 w-64 rounded-full bg-white/5 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute -bottom-1/2 -left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl sm:h-96 sm:w-96" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 md:py-36 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-2 text-4xl font-bold leading-tight sm:mb-3 sm:text-6xl md:text-7xl lg:text-8xl">
              Stop paying for 5 tools.
            </h1>
            <p className="mb-6 text-3xl font-bold text-white/80 sm:mb-8 sm:text-5xl md:text-6xl">
              Start with one.
            </p>
            <p className="mx-auto mb-8 max-w-2xl px-2 text-base text-indigo-100 sm:mb-10 sm:text-lg md:text-xl">
              Website, bookings, link-in-bio, custom domain, and email — all in
              one platform. Starting at $9/mo.
            </p>

            {/* CTA Buttons */}
            <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:mb-8 sm:flex-row sm:gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="min-h-[48px] w-full bg-white px-8 font-semibold text-indigo-700 hover:bg-indigo-50 sm:w-auto"
                >
                  Get Early Access
                </Button>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-200 transition-colors hover:text-white sm:text-base"
              >
                See pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col flex-wrap items-center justify-center gap-3 px-4 text-xs text-indigo-200 sm:flex-row sm:gap-6 sm:text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Tool Replacement Comparison Section */}
      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
              One platform replaces five subscriptions
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
              Stop juggling tools. WebVillage bundles everything you need at a
              fraction of the cost.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Tools you're paying for */}
              <div className="border-gray-200 p-6 sm:p-8 md:border-r">
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  What you&apos;re paying now
                </h3>
                <div className="space-y-4">
                  {replacedTools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                          <tool.icon className="h-4 w-4 text-gray-500" />
                        </div>
                        <span className="text-gray-500 line-through">
                          {tool.name}
                        </span>
                      </div>
                      <span className="text-gray-500 line-through">
                        ${tool.cost}/mo
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-semibold text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-500 line-through">
                    ${totalToolsCost}/mo
                  </span>
                </div>
              </div>

              {/* Right: WebVillage Pro */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 sm:p-8">
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  WebVillage Pro
                </h3>
                <div className="space-y-4">
                  {replacedTools.map((tool) => (
                    <div key={tool.name} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-gray-900">{tool.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-indigo-200/50 pt-4">
                  <span className="font-semibold text-gray-900">
                    All included
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${webVillageProCost}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom savings banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-center sm:px-8">
              <span className="text-lg font-bold text-white sm:text-xl">
                Save ${savings}/mo ({savingsPercent}%)
              </span>
              <span className="ml-2 text-sm text-indigo-200 sm:text-base">
                — that&apos;s ${savings * 12}/year back in your pocket
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
              Everything you need to go online
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
              Each feature replaces an expensive standalone tool. One login, one
              bill, zero headaches.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="bg-gray-100 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl px-2 text-base text-gray-600 sm:text-lg">
              Start free, upgrade when you need more. No hidden fees, no
              surprises.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg sm:p-8">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mb-6 text-gray-500">Perfect for getting started</p>
              <ul className="mb-8 space-y-3">
                {['1 page website', 'WebVillage subdomain', 'HTTPS included', 'Mobile responsive'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">
                Start Free
              </Button>
            </div>

            {/* Starter - Recommended */}
            <div className="relative rounded-2xl border-2 border-indigo-600 bg-white p-6 transition-shadow hover:shadow-lg sm:p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                Most Popular
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$9</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mb-6 text-gray-500">For individuals & personal brands</p>
              <ul className="mb-8 space-y-3">
                {['Custom domain', '5 pages', 'Remove branding', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg sm:p-8">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mb-6 text-gray-500">For freelancers & businesses</p>
              <ul className="mb-8 space-y-3">
                {['Unlimited pages', 'Contact forms', 'Analytics dashboard', 'Priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-500"
            >
              See all plans including Directory tiers
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Template Showcase Section */}
      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
              Beautiful templates for every purpose
            </h2>
            <p className="mx-auto max-w-2xl px-2 text-base text-gray-600 sm:text-lg">
              Choose from 20+ professionally designed templates. Customize
              colors, fonts, and content in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl bg-gray-100 transition-transform active:scale-[0.98]"
              >
                {/* Placeholder for template preview */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-sm text-gray-500">
                    {template.name} Preview
                  </span>
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="mb-1 text-xs uppercase tracking-wider text-gray-300">
                    {template.category}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                    {template.name}
                  </h3>
                  <p className="mb-4 text-center text-xs text-gray-300 sm:text-sm">
                    {template.description}
                  </p>
                  <Button
                    size="sm"
                    className="bg-white px-6 text-gray-900 hover:bg-gray-100"
                  >
                    Preview
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/templates">
              <Button variant="outline" size="lg">
                Browse All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Built With Section */}
      <section className="bg-gray-50 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
              Built on technology you can trust
            </h2>
            <p className="mx-auto max-w-2xl px-2 text-base text-gray-600 sm:text-lg">
              Every WebVillage site is powered by industry-leading
              infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {techPartners.map((partner) => (
              <div
                key={partner.name}
                className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                  {partner.name}
                </h3>
                <p className="mb-3 text-sm font-medium text-indigo-600">
                  {partner.role}
                </p>
                <p className="text-gray-600">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Signup + Final CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-12 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
            Ready to ditch the tool stack?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl px-2 text-base text-indigo-100 sm:mb-8 sm:text-lg">
            Join the waitlist and be first to consolidate your website,
            bookings, domains, and email into one platform.
          </p>

          {/* Email signup form */}
          <div className="mx-auto mb-8 max-w-md">
            {emailStatus === 'success' ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-300" />
                <span className="font-medium text-white">
                  You&apos;re on the list! We&apos;ll be in touch.
                </span>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 sm:text-base"
                />
                <Button
                  type="submit"
                  disabled={emailStatus === 'loading'}
                  className="min-h-[48px] bg-white px-6 font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  {emailStatus === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Get Early Access'
                  )}
                </Button>
              </form>
            )}
            {emailStatus === 'error' && (
              <p className="mt-2 text-sm text-red-300">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col flex-wrap items-center justify-center gap-2 text-xs text-indigo-200 sm:mt-8 sm:flex-row sm:gap-6 sm:text-sm">
            <span>No credit card required</span>
            <span>14-day money-back guarantee</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  )
}
