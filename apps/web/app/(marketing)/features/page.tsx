import { Metadata } from 'next'
import Link from 'next/link'
import {
  Palette,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Mail,
  Search,
  Smartphone,
  Clock,
  Users,
  CreditCard,
  Headphones,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Discover all the powerful features that make WebVillage the best choice for creating professional websites. Templates, custom domains, SEO tools, and more.',
}

const features = [
  {
    icon: Palette,
    title: 'Beautiful Templates',
    description:
      '20+ professionally designed templates for portfolios, businesses, blogs, and more. Customize colors, fonts, and layouts to match your brand.',
    category: 'Design',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    description:
      'Connect your own domain or register a new one directly through WebVillage. Free SSL certificates included with every site.',
    category: 'Hosting',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Built on modern infrastructure with global CDN. Your site loads in milliseconds, anywhere in the world.',
    category: 'Performance',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description:
      'Free SSL/HTTPS, DDoS protection, and automatic backups. Enterprise-grade security for every website.',
    category: 'Security',
  },
  {
    icon: Search,
    title: 'SEO Optimized',
    description:
      'Built-in SEO tools help your site rank higher. Meta tags, sitemaps, and structured data are handled automatically.',
    category: 'Marketing',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description:
      'Every template looks perfect on any device. Automatic responsive design ensures a great experience for all visitors.',
    category: 'Design',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Track visitors, page views, and engagement. Understand your audience with built-in analytics.',
    category: 'Marketing',
  },
  {
    icon: Mail,
    title: 'Professional Email',
    description:
      'Get email addresses at your domain (you@yoursite.com). Professional email hosting included with Pro plans.',
    category: 'Communication',
  },
  {
    icon: Clock,
    title: '99.9% Uptime',
    description:
      'Your site is always online. We guarantee 99.9% uptime with automatic failover and redundancy.',
    category: 'Hosting',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Invite team members to help manage your site. Role-based permissions keep everyone productive.',
    category: 'Management',
  },
  {
    icon: CreditCard,
    title: 'E-commerce Ready',
    description:
      'Accept payments with Stripe integration. Sell products, services, or subscriptions directly from your site.',
    category: 'Business',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Get help when you need it. Our support team is available around the clock via chat and email.',
    category: 'Support',
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-600 to-purple-700 px-4 pb-20 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Everything you need to build a great website
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-indigo-100">
            Powerful features, simple interface. Create professional websites
            without writing a single line of code.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 transition-colors hover:bg-gray-100"
            >
              Start Free
            </Link>
            <Link
              href="/templates"
              className="rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Built for creators, designers, and businesses
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Every feature you need to create, launch, and grow your online
              presence.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
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
                <h3 className="mt-2 mb-3 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-xl text-gray-400">
            Create your website in minutes. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Start Building Free
          </Link>
        </div>
      </section>
    </div>
  )
}
