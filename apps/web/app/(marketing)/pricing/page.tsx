'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  X,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  Users,
  CreditCard,
  Shield,
  Globe,
  Mail,
  HardDrive,
  Headphones,
  ArrowRight,
} from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Switch } from '@webvillage/ui'
import {
  PLANS,
  getVisiblePlans,
  getDirectoryPlans,
  MYR_PRICES,
  PLAN_REPLACEMENT_MESSAGES,
  ADDONS,
  FEATURE_COMPARISON,
  type PlanId,
  type BillingInterval,
} from '@webvillage/config'

type Currency = 'USD' | 'MYR'

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')
  const [showDirectoryPlans, setShowDirectoryPlans] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [currency, setCurrency] = useState<Currency>('USD')

  const visiblePlans = getVisiblePlans()
  const directoryPlans = getDirectoryPlans()

  const getPrice = (planId: PlanId) => {
    if (currency === 'MYR') {
      return billingInterval === 'annual' ? MYR_PRICES[planId].annual : MYR_PRICES[planId].monthly
    }
    const plan = PLANS[planId]
    return billingInterval === 'annual' ? plan.annualPrice : plan.monthlyPrice
  }

  const getCurrencySymbol = () => (currency === 'MYR' ? 'RM' : '$')

  const getSavingsPercent = (planId: PlanId) => {
    const plan = PLANS[planId]
    if (plan.monthlyPrice === 0) return 0
    return Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100)
  }

  const faqItems = [
    {
      question: 'What tools does WebVillage replace?',
      answer:
        'WebVillage replaces your link-in-bio tool (like Linktree), website builder (like Wix or Squarespace), scheduling tool (like Calendly), and optionally your domain registrar and email provider. On the Pro plan, you get all of this for $19/mo instead of paying $42+/mo for separate tools.',
    },
    {
      question: 'Can I start for free and upgrade later?',
      answer:
        'Absolutely! Start with our free plan and upgrade anytime. Your content and settings are preserved when you upgrade. No lock-in, no penalties.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express). Malaysian users paying in MYR can also use FPX — Malaysia's instant bank transfer network. Enterprise plans can pay by invoice.",
    },
    {
      question: 'Can I keep my existing domain?',
      answer:
        'Yes! On Starter and above, you can connect any domain you already own. Just update your DNS records and your site goes live on your domain within minutes. You can also register a new domain directly through WebVillage starting at $12/year.',
    },
    {
      question: 'What happens if I cancel?',
      answer:
        "If you cancel a paid plan, you'll be downgraded to Free at the end of your billing period. Your site stays live on a WebVillage subdomain, but features above the Free tier will be disabled.",
    },
    {
      question: 'Is there a money-back guarantee?',
      answer:
        "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 14 days for a full refund.",
    },
    {
      question: 'Is there a contract or commitment?',
      answer:
        'No contracts! All plans are month-to-month (or annual if you choose). Cancel anytime from your dashboard.',
    },
    {
      question: 'Is my site secure?',
      answer:
        "Yes. All WebVillage sites include free SSL/HTTPS certificates and DDoS protection. We deploy on Vercel's edge network with Cloudflare DNS for fast, reliable hosting.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 pb-16 pt-24 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-3 text-3xl font-bold text-white sm:mb-4 sm:text-4xl md:text-5xl">
            Simple pricing. No surprises.
          </h1>
          <p className="mb-6 px-2 text-lg text-white/90 sm:mb-8 sm:text-xl">
            Replace your $42/mo tool stack with one platform.
          </p>

          {/* Billing Toggle + Currency Toggle */}
          <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="flex items-center gap-4">
                <span
                  className={`text-base sm:text-lg ${billingInterval === 'monthly' ? 'font-semibold text-white' : 'text-white/70'}`}
                >
                  Monthly
                </span>
                <Switch
                  checked={billingInterval === 'annual'}
                  onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
                  className="data-[state=checked]:bg-green-500"
                />
                <span
                  className={`text-base sm:text-lg ${billingInterval === 'annual' ? 'font-semibold text-white' : 'text-white/70'}`}
                >
                  Annual
                </span>
              </div>
              {billingInterval === 'annual' && (
                <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">Save 20%</span>
              )}
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center gap-2 rounded-full bg-white/10 p-1">
              <button
                onClick={() => setCurrency('USD')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  currency === 'USD'
                    ? 'bg-white text-indigo-700'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('MYR')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  currency === 'MYR'
                    ? 'bg-white text-indigo-700'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                MYR (RM)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Stack Comparison Bar */}
      <section className="relative z-20 -mt-8 mb-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6">
            <p className="mb-3 text-center text-sm font-medium text-gray-500">Your current tool stack</p>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm sm:gap-3">
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-900">Linktree $9</span>
              <span className="text-gray-400">+</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-900">Wix $16</span>
              <span className="text-gray-400">+</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-900">Calendly $10</span>
              <span className="text-gray-400">+</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-900">Domain $1</span>
              <span className="text-gray-400">+</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-900">Email $6</span>
              <span className="text-gray-400">=</span>
              <span className="rounded-lg bg-red-50 px-3 py-1.5 font-bold text-red-600 line-through">$42/mo</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <ArrowRight className="hidden h-5 w-5 text-green-600 sm:block" />
              <p className="text-center">
                <span className="text-lg font-bold text-green-600">
                  WebVillage Pro: {getCurrencySymbol()}
                  {getPrice('pro')}/mo
                </span>
                <span className="ml-2 text-sm text-gray-500">(save 55%)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Cards */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {visiblePlans.map((plan) => (
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
                      <Sparkles className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-4 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {getCurrencySymbol()}
                        {getPrice(plan.id)}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    {billingInterval === 'annual' && plan.monthlyPrice > 0 && (
                      <p className="mt-1 text-sm text-green-600">
                        Save {getSavingsPercent(plan.id)}% with annual billing
                      </p>
                    )}
                    {plan.monthlyPrice === 0 && <p className="mt-1 text-sm text-gray-500">Forever free</p>}
                  </div>

                  <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{PLAN_REPLACEMENT_MESSAGES[plan.id]}</p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        ) : (
                          <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                        )}
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.name}
                          {feature.value && feature.included && (
                            <span className="ml-1 text-sm text-gray-500">({feature.value})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Storage</p>
                        <p className="font-semibold text-gray-900">{plan.limits.storage}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Bandwidth</p>
                        <p className="font-semibold text-gray-900">{plan.limits.bandwidth}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4">
                  <Link href="/signup" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.recommended ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                  {plan.ctaSubtext && (
                    <p className="text-center text-xs text-gray-500">{plan.ctaSubtext}</p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Directory Plans Toggle */}
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowDirectoryPlans(!showDirectoryPlans)}
              className="inline-flex items-center gap-2 rounded-md font-medium text-indigo-600 outline-none hover:text-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Building2 className="h-5 w-5" />
              Need more? See Directory plans for marketplaces &amp; communities
              {showDirectoryPlans ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {/* Directory Plans */}
          {showDirectoryPlans && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {directoryPlans.map((plan) => (
                <Card key={plan.id} className="relative flex flex-col border border-gray-200 shadow-lg">
                  <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4 text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {getCurrencySymbol()}
                          {getPrice(plan.id)}
                        </span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      {billingInterval === 'annual' && getSavingsPercent(plan.id) > 0 && (
                        <p className="mt-1 text-sm text-green-600">
                          Save {getSavingsPercent(plan.id)}% with annual billing
                        </p>
                      )}
                    </div>
                    <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-center">
                      <p className="text-sm font-medium text-gray-900">{PLAN_REPLACEMENT_MESSAGES[plan.id]}</p>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.slice(0, 8).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                          <span className="text-gray-900">
                            {feature.name}
                            {feature.value && (
                              <span className="ml-1 text-sm text-gray-500">({feature.value})</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-4">
                    <Link href="/signup" className="w-full">
                      <Button className="w-full" variant="default" size="lg">
                        {plan.ctaText}
                      </Button>
                    </Link>
                    {plan.ctaSubtext && (
                      <p className="text-center text-xs text-gray-500">{plan.ctaSubtext}</p>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Enhance your presence with add-ons</h2>
            <p className="text-gray-500">Complete your online presence with these optional extras</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ADDONS.map((addon) => (
              <Card key={addon.id} className="border border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {addon.id === 'domain' && <Globe className="h-6 w-6 text-indigo-600" />}
                    {addon.id === 'email' && <Mail className="h-6 w-6 text-indigo-600" />}
                    {addon.id === 'storage' && <HardDrive className="h-6 w-6 text-indigo-600" />}
                    {addon.id === 'priority_support' && <Headphones className="h-6 w-6 text-indigo-600" />}
                    <CardTitle className="text-lg">{addon.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-500">{addon.description}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${addon.price}
                    <span className="text-sm font-normal text-gray-500">
                      /{addon.interval === 'yearly' ? 'year' : 'month'}
                    </span>
                  </p>
                  {addon.id === 'email' && (
                    <p className="mt-1 text-xs font-medium text-green-600">
                      2,900% cheaper than Google Workspace
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl">Compare all features</h2>
            <p className="text-sm text-gray-500 sm:text-base">See exactly what you get with each plan</p>
          </div>

          <div className="relative -mx-4 overflow-x-auto sm:mx-0">
            <div className="min-w-[800px] px-4 sm:px-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="sticky left-0 z-10 min-w-[140px] bg-white px-3 py-3 text-left text-sm font-semibold text-gray-900 sm:px-4 sm:py-4 sm:text-base">
                      Feature
                    </th>
                    {['Free', 'Starter', 'Pro', 'Directory', 'Dir Pro', 'Enterprise'].map((name) => (
                      <th key={name} className={`min-w-[80px] px-2 py-3 text-center text-xs font-semibold text-gray-900 sm:px-4 sm:py-4 sm:text-base ${name === 'Pro' ? 'bg-indigo-50' : ''}`}>
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(FEATURE_COMPARISON).map(([category, features]) => (
                    <Fragment key={category}>
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-3 py-2 text-sm font-semibold text-gray-900 sm:px-4 sm:py-3 sm:text-base">
                          {category}
                        </td>
                      </tr>
                      {features.map((feature, idx) => (
                        <tr key={`${category}-${idx}`} className="border-b border-gray-100">
                          <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs text-gray-900 sm:px-4 sm:py-3 sm:text-sm">
                            {feature.name}
                          </td>
                          {(['free', 'starter', 'pro', 'directory', 'directory_pro', 'enterprise'] as const).map((planId) => (
                            <td
                              key={planId}
                              className={`px-2 py-2 text-center sm:px-4 sm:py-3 ${planId === 'pro' ? 'bg-indigo-50' : ''}`}
                            >
                              {renderFeatureValue(feature[planId])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqItems.map((item, idx) => (
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

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-3xl md:text-4xl">
            Stop paying for 5 tools. Start with one.
          </h2>
          <p className="mb-6 px-2 text-base text-indigo-100 sm:mb-8 sm:text-xl">
            Start free. No credit card required. Upgrade when you need more.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="min-h-[48px] w-full bg-white px-8 text-indigo-600 hover:bg-gray-100 sm:w-auto">
                <Zap className="mr-2 h-5 w-5" />
                Start Free
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-col flex-wrap items-center justify-center gap-3 text-sm text-indigo-100 sm:mt-8 sm:flex-row sm:gap-6 sm:text-base">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              14-day money-back guarantee
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

function renderFeatureValue(value: unknown) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-green-600" />
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-gray-300" />
  }
  if (value === '-') {
    return <span className="text-gray-400">-</span>
  }
  return <span className="text-sm text-gray-900">{String(value)}</span>
}
