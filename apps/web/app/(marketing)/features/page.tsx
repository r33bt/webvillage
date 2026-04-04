import { Metadata } from 'next'
import {
  Building2,
  Users,
  Search,
  Mail,
  Globe,
  Network,
  Database,
  ArrowRight,
  Check,
  Smartphone,
  Code2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features — Done-For-You Directory Network',
  description:
    'WebVillage builds, migrates, and maintains your member directory. Professional design, SEO from day one, email hosting, and a cross-directory network — all managed for you.',
}

const coreFeatures = [
  {
    icon: Database,
    category: 'Done-For-You Service',
    title: 'Data Migration Included',
    description:
      'We import your existing member data from spreadsheets, WordPress plugins, old CMS exports, or any other source. No manual re-entry. No data loss.',
  },
  {
    icon: Building2,
    category: 'Done-For-You Service',
    title: 'Professional Design',
    description:
      'Your directory built on the WebVillage design system with your brand colours and logo applied. Looks polished from day one — no design agency needed.',
  },
  {
    icon: Globe,
    category: 'Done-For-You Service',
    title: 'SEO Setup Day One',
    description:
      'robots.txt, sitemap.xml, canonical tags, and JSON-LD structured data per listing — all configured at launch. Your directory is discoverable from the moment it goes live.',
  },
  {
    icon: Smartphone,
    category: 'Directory Engine',
    title: 'Mobile-First Search & Filter',
    description:
      'Members find who they are looking for on any device. Fast full-text search, category filters, and location filtering that actually work — not a broken WordPress plugin.',
  },
  {
    icon: Users,
    category: 'Directory Engine',
    title: 'Member Self-Service',
    description:
      'Members can claim and update their own listing. No more quarterly emails asking the admin to fix outdated entries. Directory stays fresh automatically.',
  },
  {
    icon: Network,
    category: 'Network Effects',
    title: 'Cross-Directory Network',
    description:
      'Every directory on the WebVillage network is connected. Your members appear in the meta-directory at webvillage.com, and each node strengthens the SEO of all others.',
  },
  {
    icon: Mail,
    category: 'Email Hosting',
    title: 'Professional Email Included',
    description:
      'Managed tiers include email hosting. Starter gets 3 MXroute mailboxes (webmail + IMAP). Professional and above gets full Google Workspace — Gmail, Calendar, Drive, and Meet.',
  },
  {
    icon: Search,
    category: 'Directory Engine',
    title: 'Category & Location Pages',
    description:
      'Auto-generated pages for every category, location, and combination. Each page is SEO-optimised and links the network together — turning your directory into a content asset.',
  },
]

const deploymentScenarios = [
  {
    label: 'Scenario A',
    title: 'Full Turnkey',
    description:
      'WV registers your domain and handles everything end-to-end. Ideal for new directories with no existing web presence.',
  },
  {
    label: 'Scenario B',
    title: 'Existing Domain',
    description:
      'You own the domain. Delegate DNS to WV (recommended) and we manage all records, SSL, and renewals going forward.',
  },
  {
    label: 'Scenario C',
    title: 'Subdomain Deploy',
    description:
      "Add a single CNAME record and go live in hours. No NS change required — perfect if your IT team can't or won't touch the root domain.",
  },
  {
    label: 'Scenario D',
    title: 'Manual DNS',
    description:
      'WV provides the exact DNS records. Your IT team adds them. We handle everything else. Works with any registrar or DNS provider.',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Migrate',
    description:
      'Send us your member list — spreadsheet, WordPress export, or old CMS dump. We clean, structure, and import every record. No data loss, no manual re-entry.',
  },
  {
    step: '02',
    title: 'Deploy',
    description:
      'We build and configure your directory: design system applied, DNS pointed, SEO wired, email hosting live. You review and approve before anything goes public.',
  },
  {
    step: '03',
    title: 'Maintain',
    description:
      'We handle updates, security, and hosting. Your members self-update their listings. You get a directory that stays current without draining your team.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 pb-20 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-indigo-100">
            <Network className="h-4 w-4" />
            Done-for-you directory network
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Your member directory,
            <br />
            done for you
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-indigo-100">
            We build, migrate, and maintain your directory. You focus on serving
            members — not fixing broken plugins or chasing outdated entries.
          </p>
          <a
            href="mailto:hello@webvillage.com"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 transition-colors hover:bg-gray-100"
          >
            Book a demo
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Everything your directory needs — built in
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              No plugins to wrangle, no developers to hire, no quarterly
              maintenance invoices. It&apos;s all included.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl bg-gray-50 p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {feature.category}
                </span>
                <h3 className="mb-3 mt-2 text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              How it works
            </h2>
            <p className="mx-auto max-w-xl text-xl text-gray-600">
              Three steps from &ldquo;our directory is a mess&rdquo; to &ldquo;our directory runs
              itself.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Scenarios */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Works with your existing setup
            </h2>
            <p className="mx-auto max-w-xl text-xl text-gray-600">
              Whether you own a domain, need a subdomain, or want us to handle
              everything — there&apos;s a deployment path for you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {deploymentScenarios.map((scenario) => (
              <div
                key={scenario.label}
                className="rounded-xl border border-gray-200 p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
                    {scenario.label}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-gray-600">{scenario.description}</p>
              </div>
            ))}
          </div>

          {/* Coming Soon callout */}
          <div className="mt-10 rounded-xl bg-indigo-50 border border-indigo-100 p-6">
            <div className="flex items-start gap-4">
              <Code2 className="mt-1 h-6 w-6 flex-shrink-0 text-indigo-500" />
              <div>
                <p className="font-semibold text-gray-900">
                  Self-serve embed coming soon
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  A{' '}
                  <code className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-xs text-indigo-700">
                    {'<webvillage-directory>'}
                  </code>{' '}
                  web component that works on any platform, plus a WordPress
                  plugin. Free tier includes 50 listings on{' '}
                  <span className="font-medium">webvillage.com/d/[slug]</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Checklist */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              What&apos;s included in every managed directory
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              'Data migration from any source',
              'Professional branded design',
              'Mobile-first search and filters',
              'Member self-service listing management',
              'SEO: sitemap, robots.txt, JSON-LD per listing',
              'Category pages + location pages auto-generated',
              'Email hosting (MXroute or Google Workspace)',
              'DNS management and SSL certificates',
              'Onboarding call + handover documentation',
              '"Powered by WebVillage" network badge',
              'Listing in webvillage.com meta-directory',
              'Cross-directory SEO network effects',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to modernise your directory?
          </h2>
          <p className="mb-8 text-xl text-gray-400">
            Associations, chambers, and professional bodies across the network
            replaced broken WordPress plugins with a managed directory that
            actually works.
          </p>
          <a
            href="mailto:hello@webvillage.com"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Book a demo
            <ArrowRight className="h-5 w-5" />
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Or email us directly at{' '}
            <a
              href="mailto:hello@webvillage.com"
              className="text-indigo-400 hover:text-indigo-300"
            >
              hello@webvillage.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
