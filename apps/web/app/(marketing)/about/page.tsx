import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about WebVillage — the all-in-one platform that replaces your website builder, link-in-bio, booking tool, domain registrar, and email provider.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            One platform, not five subscriptions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-indigo-100">
            WebVillage was built for freelancers, small businesses, and creators
            who are tired of juggling separate tools for their website, bookings,
            link-in-bio, domain, and email.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            Why we built WebVillage
          </h2>
          <div className="space-y-4 text-lg text-gray-600">
            <p>
              The average freelancer spends $42/month on separate tools: a
              website builder, a link-in-bio page, a scheduling tool, a domain
              registrar, and email hosting. That&apos;s over $500/year — and
              none of these tools talk to each other.
            </p>
            <p>
              We built WebVillage to consolidate all of that into one platform.
              One login, one bill, and everything works together out of the box.
            </p>
            <p>
              Our Pro plan gives you everything for $19/mo — saving you 55%
              compared to buying each tool separately.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            What we believe
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: 'Simplicity',
                description:
                  'Building a website should be as easy as filling out a form. No coding, no complexity.',
              },
              {
                title: 'Honesty',
                description:
                  'No fake stats, no inflated numbers. We show real data and earn trust through transparency.',
              },
              {
                title: 'Value',
                description:
                  "You shouldn't need 5 subscriptions to go online. One platform, one price, everything included.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Built on trusted infrastructure
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Vercel', role: 'Global edge hosting' },
              { name: 'Stripe', role: 'Secure payments' },
              { name: 'Cloudflare', role: 'DNS & security' },
              { name: 'Supabase', role: 'Database & auth' },
            ].map((partner) => (
              <div
                key={partner.name}
                className="rounded-lg border border-gray-200 p-4 text-center"
              >
                <p className="text-lg font-semibold text-gray-900">
                  {partner.name}
                </p>
                <p className="text-sm text-gray-500">{partner.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to simplify your online presence?
          </h2>
          <p className="mb-8 text-lg text-indigo-100">
            Start free. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 transition-colors hover:bg-gray-100"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}
