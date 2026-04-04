import { Metadata } from 'next'
import { Network, Wrench, Server, Quote, Users, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About WebVillage',
  description:
    'WebVillage is the managed directory network for associations, chambers of commerce, and industry bodies. We build, deploy, and maintain your member directory — so your team doesn\'t have to.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            The managed directory network for associations
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100">
            We build and maintain member directories for associations, chambers,
            and industry bodies worldwide. Your members get found. You get time
            back.
          </p>
          <a
            href="mailto:hello@webvillage.com"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 transition-colors hover:bg-gray-100"
          >
            Book a demo
          </a>
        </div>
      </section>

      {/* Problem section */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            The state of member directories today
          </h2>
          <p className="mb-10 text-center text-lg text-gray-500">
            We hear the same story from every association we speak to.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  'Our member directory is basically a spreadsheet we copied into a WordPress plugin. Half the entries are three years out of date.',
                attribution: 'Chamber of commerce executive',
              },
              {
                quote:
                  "Members can't find anyone on their phone. The filters don't work, half the links are broken, and we haven't had budget to fix it.",
                attribution: 'Trade association operations director',
              },
              {
                quote:
                  'We pay a developer every quarter just to keep the directory plugin from breaking. It\'s not a feature — it\'s a liability.',
                attribution: 'Industry body administrator',
              },
            ].map((item) => (
              <div
                key={item.attribution}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6"
              >
                <Quote className="mb-4 h-6 w-6 text-indigo-400" />
                <p className="mb-4 text-gray-700 italic">&ldquo;{item.quote}&rdquo;</p>
                <p className="text-sm font-medium text-gray-500">
                  — {item.attribution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why we built WebVillage */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Why we built WebVillage
          </h2>
          <div className="space-y-5 text-lg text-gray-600">
            <p>
              Every association has the same problem. The WordPress plugin was
              installed by a volunteer or contractor years ago. It&apos;s being
              held together with duct tape, and nobody on the team has the time
              or the mandate to fix it.
            </p>
            <p>
              Software vendors sell you the license and leave you to figure out
              the rest. Website agencies quote $15,000 to rebuild — and after
              that, you&apos;re still responsible for maintaining it yourself.
              You&apos;re back to square one.
            </p>
            <p>
              We saw the same pattern across dozens of organisations. The
              problem was never the software. It was that nobody was taking
              responsibility for running the directory as a service.
            </p>
            <p className="font-semibold text-gray-800">
              WebVillage is that service. We manage the directory so your team
              doesn&apos;t have to.
            </p>
          </div>
        </div>
      </section>

      {/* What makes WebVillage different */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            What makes WebVillage different
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Wrench,
                title: 'Managed, not licensed',
                description:
                  "We don't sell you software and leave. We build it, deploy it, and maintain it month after month. When something breaks, we fix it — not you.",
              },
              {
                icon: Network,
                title: 'Network effects',
                description:
                  'Every directory on the WebVillage network is connected. Cross-network SEO and discoverability that no isolated tool or WordPress plugin can provide.',
              },
              {
                icon: Server,
                title: 'Built on modern infrastructure',
                description:
                  'Vercel edge hosting, Supabase database, Cloudflare DNS. Not WordPress. Not shared hosting. Not a plugin from 2014.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6"
              >
                <item.icon className="mb-4 h-8 w-8 text-indigo-600" />
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Who we serve
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <Building2 className="mb-4 h-8 w-8 text-indigo-600" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Associations and chambers
              </h3>
              <p className="text-gray-600">
                Trade associations, professional bodies, chambers of commerce,
                and industry federations with 100–2,000 members. You have a
                website that hasn&apos;t been touched in years, a directory that
                looks like it was built in 2012, and a team with no bandwidth to
                fix it. WebVillage migrates your data, deploys a modern
                directory, handles SEO, and maintains it going forward — zero IT
                work required from your end.
              </p>
            </div>
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <Users className="mb-4 h-8 w-8 text-indigo-600" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Web agencies
              </h3>
              <p className="text-gray-600">
                If you&apos;re an agency that builds association websites and
                keeps getting asked about member directories, we have a
                white-label programme. Offer your clients a managed directory
                without adding it to your maintenance burden. Contact us to
                learn more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech section */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Built on trusted infrastructure
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Vercel', role: 'Global edge hosting' },
              { name: 'Supabase', role: 'Database & auth' },
              { name: 'Cloudflare', role: 'DNS & CDN' },
              { name: 'Resend', role: 'Email delivery' },
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
            Ready to modernise your directory?
          </h2>
          <p className="mb-8 text-lg text-indigo-100">
            Tell us about your association and we&apos;ll show you what a
            managed directory looks like for your members.
          </p>
          <a
            href="mailto:hello@webvillage.com"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 transition-colors hover:bg-gray-100"
          >
            Book a demo
          </a>
        </div>
      </section>
    </div>
  )
}
