import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member Directories — Vertical 1 hub',
  description:
    'WebVillage Member Directories — done-for-you directories for chambers of commerce, regional associations, and industry bodies. Managed service or self-serve embed. FindTraining is the founding live directory.',
}

const ICPS = [
  {
    code: 'ICP-0',
    name: 'Bilateral Chamber of Commerce',
    tag: 'Primary beachhead — Managed Tier',
    description:
      "Cross-border chambers (e.g. MY–DE, MY–SG, MY–IT). 30–200 corporate members. Currently using a static member list on the chamber's CMS or no directory at all. Wants searchable, mobile-friendly member discovery without hiring a developer.",
    pricing: 'Professional or Enterprise managed tier',
  },
  {
    code: 'ICP-1',
    name: 'Regional Association',
    tag: 'Secondary — Managed Tier',
    description:
      '50–500 member professional / industry / trade association. Has a website but the member directory is a flat PDF or password-protected page. Wants public discoverability that drives member value.',
    pricing: 'Starter or Professional managed tier',
  },
  {
    code: 'ICP-2',
    name: 'Web Agency',
    tag: 'Reseller — Enterprise Tier',
    description:
      'Digital agency that builds chamber / association sites for clients. White-labels the directory under their own brand. We handle the directory; they keep the client relationship.',
    pricing: 'Enterprise white-label tier',
  },
  {
    code: 'ICP-3',
    name: 'Self-Serve Embedder',
    tag: 'Phase 2 — Plugin / Embed',
    description:
      'Smaller communities, niche industry groups, individual operators. Adds the directory to an existing site via WordPress plugin or universal embed. Self-managed; pays per-listing tier.',
    pricing: 'Free / Pro / Business self-serve tiers',
  },
]

const SELF_SERVE_TIERS = [
  {
    name: 'Free',
    price: '$0/mo',
    listings: '50 listings',
    domain: 'webvillage.com/d/[slug]',
    branding: 'WebVillage-branded',
    cta: 'Get embed',
  },
  {
    name: 'Pro',
    price: '$29/mo',
    listings: 'Unlimited',
    domain: 'Custom domain',
    branding: 'Custom styling',
    cta: 'Subscribe',
  },
  {
    name: 'Business',
    price: '$79/mo',
    listings: 'Unlimited',
    domain: 'Custom domain',
    branding: 'Multi-directory, API, analytics',
    cta: 'Subscribe',
  },
]

const MANAGED_TIERS = [
  {
    name: 'Starter',
    setup: '$2,500',
    monthly: '$299/mo',
    listings: 'Up to 500',
    email: '3 mailboxes (MXroute)',
    whiteLabel: 'No',
    deliverables: [
      'Directory app deployed on Vercel with SSL',
      'Domain setup, professional email, data migration',
      'Basic SEO — title tags, meta, H1s, JSON-LD per listing',
      'Standard design (WV system, your brand colours + logo)',
      'Email support, 5-business-day response',
      'Monthly uptime monitoring',
    ],
  },
  {
    name: 'Professional',
    setup: '$5,000',
    monthly: '$599/mo',
    listings: 'Up to 2,000',
    email: '5 mailboxes (Google Workspace)',
    whiteLabel: 'No',
    deliverables: [
      'Everything in Starter',
      'Up to 2,000 listings',
      'SEO content — category landing pages, location pages, FAQ',
      'Custom design (bespoke layout, typography, brand identity)',
      'Dedicated support, 48hr SLA, named contact',
      'Monthly analytics report (traffic, searches, top listings)',
      'Quarterly content refresh',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    setup: '$10,000+',
    monthly: '$999+/mo',
    listings: 'Unlimited',
    email: '10 mailboxes (Google Workspace)',
    whiteLabel: 'Yes',
    deliverables: [
      'Everything in Professional',
      'Full white-label — no WV badge anywhere',
      'Custom feature development (booking, payments, events)',
      'Dedicated account manager',
      '24hr support SLA',
      'Full API access',
      'Custom analytics dashboard',
    ],
  },
]

const FEATURES = [
  {
    title: 'Member discovery that members actually use',
    body: 'Mobile-friendly search and filter, category browse, location browse, full-text search across listing fields. No login wall. Public-by-default with member claim flow for opt-in enrichment.',
  },
  {
    title: 'SEO-ready day 1',
    body: 'robots.txt, sitemap.xml, canonical tags, JSON-LD structured data per listing — built into the engine. Category and location landing pages on Professional tier.',
  },
  {
    title: 'Member claim flow',
    body: 'Self-serve claim by email or domain match. Once claimed, members enhance their own listing — logo, photos, services, contact details. Reduces ops overhead for the chamber.',
  },
  {
    title: 'Domain flexibility',
    body: 'We support four scenarios — full turnkey (we register and manage), nameserver transfer (recommended), CNAME subdomain (lowest friction), or manual DNS where you keep control.',
  },
  {
    title: 'PDPA / GDPR-compliant data handling',
    body: 'Data migration with provenance, member consent tracking on the claim flow, privacy policy templates, deletion / export workflows.',
  },
  {
    title: 'Cross-network discovery (Phase 2)',
    body: 'Directories on the WebVillage network surface in cross-network discovery — businesses listed in one chamber can be discovered by adjacent chambers, with chamber consent. Available on Professional and Enterprise tiers.',
  },
]

export default function DirectoriesPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#F0FAF9] to-white pt-32 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">
            Vertical 1 — Member Directories
          </p>
          <h1 className="mb-6 text-4xl font-bold text-[#1C2B28] sm:text-5xl">
            Member directories for chambers, associations, and industry bodies
          </h1>
          <p className="mb-8 text-lg text-[#6B7C79] sm:text-xl">
            We build, host, and run the member directory so your members can be found and your team can focus on the business of the chamber. Done-for-you on managed tiers; self-serve on the plugin / embed tiers.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B45309]"
            >
              Talk to us about your chamber
              <span aria-hidden>&rarr;</span>
            </a>
            <a
              href="/directories/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-[#1C2B28] transition-colors hover:bg-slate-50"
            >
              See pricing
            </a>
          </div>
          <p className="mt-6 text-sm text-[#6B7C79]">
            <span className="font-semibold text-[#0F766E]">Founding live directory:</span>{' '}
            <a className="underline-offset-2 hover:underline" href="https://findtraining.com" target="_blank" rel="noopener">
              FindTraining.com
            </a>{' '}
            — Malaysia HRDF-claimable training providers.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">Who it's for</h2>
          <p className="mb-12 max-w-3xl text-[#6B7C79]">
            Four ideal customer profiles. The first three are managed tiers; the fourth is self-serve and opens in Phase 2.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {ICPS.map((icp) => (
              <article key={icp.code} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-3 flex items-baseline gap-3">
                  <span className="rounded-full bg-[#F0FAF9] px-2.5 py-0.5 text-xs font-semibold text-[#0F766E]">
                    {icp.code}
                  </span>
                  <h3 className="text-lg font-bold text-[#1C2B28]">{icp.name}</h3>
                </div>
                <p className="mb-3 text-sm font-semibold text-[#D97706]">{icp.tag}</p>
                <p className="mb-4 text-sm text-[#6B7C79]">{icp.description}</p>
                <p className="text-sm text-[#1C2B28]">
                  <span className="font-semibold">Pricing:</span> {icp.pricing}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">What's in every directory</h2>
          <p className="mb-12 max-w-3xl text-[#6B7C79]">
            Same engine across every tier. The differences are in scale, design depth, support SLA, and white-label.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6">
                <h3 className="mb-3 text-lg font-bold text-[#1C2B28]">{f.title}</h3>
                <p className="text-sm text-[#6B7C79]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Managed tiers preview */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">Managed service — done for you</h2>
          <p className="mb-10 max-w-3xl text-[#6B7C79]">
            We register or migrate the domain, set up email, run the data migration, deploy the directory, and operate it ongoing. You focus on the chamber; we keep the directory running.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {MANAGED_TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-xl border p-6 ${
                  tier.featured
                    ? 'border-[#0F766E] bg-[#F0FAF9] ring-2 ring-[#0F766E]/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {tier.featured && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                    Most chambers pick this
                  </p>
                )}
                <h3 className="mb-2 text-2xl font-bold text-[#1C2B28]">{tier.name}</h3>
                <p className="mb-1 text-3xl font-bold text-[#1C2B28]">
                  {tier.setup}
                  <span className="ml-1 text-base font-normal text-[#6B7C79]">setup</span>
                </p>
                <p className="mb-6 text-lg text-[#6B7C79]">{tier.monthly}</p>

                <dl className="mb-6 space-y-1.5 text-sm">
                  <DLRow label="Listings" value={tier.listings} />
                  <DLRow label="Email" value={tier.email} />
                  <DLRow label="White-label" value={tier.whiteLabel} />
                </dl>

                <ul className="space-y-2 text-sm text-[#1C2B28]">
                  {tier.deliverables.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span aria-hidden className="text-[#0F766E]">&#10003;</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-[#1C2B28]">
              <span className="font-semibold">Founding Member Programme</span> — first 5 B2B clients only. 40% off setup fee, monthly rate locked at founding price, product input rights, prominent placement in the network, named case study.
            </p>
          </div>

          <div className="mt-8">
            <a
              href="/directories/pricing"
              className="inline-flex items-center gap-2 font-semibold text-[#0F766E] underline-offset-2 hover:underline"
            >
              Full pricing details
              <span aria-hidden>&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* Self-serve preview */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">Self-serve embed</h2>
          <p className="mb-10 max-w-3xl text-[#6B7C79]">
            For smaller communities, individual operators, and anyone who wants the directory on their own site without a managed contract. WordPress plugin and universal JS embed (Phase 2).
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {SELF_SERVE_TIERS.map((tier) => (
              <div key={tier.name} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-2 text-xl font-bold text-[#1C2B28]">{tier.name}</h3>
                <p className="mb-4 text-2xl font-bold text-[#1C2B28]">{tier.price}</p>
                <dl className="space-y-1.5 text-sm">
                  <DLRow label="Listings" value={tier.listings} />
                  <DLRow label="Domain" value={tier.domain} />
                  <DLRow label="Branding" value={tier.branding} />
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#F0FAF9] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-[#1C2B28]">Run a chamber or association?</h2>
          <p className="mb-8 text-[#6B7C79]">
            Tell us about your member base and current state and we'll come back with a fit, a quote, and a sample directory built with anonymised data.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B45309]"
          >
            Talk to us
            <span aria-hidden>&rarr;</span>
          </a>
        </div>
      </section>
    </div>
  )
}

function DLRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 flex-shrink-0 text-[#6B7C79]">{label}</dt>
      <dd className="text-[#1C2B28]">{value}</dd>
    </div>
  )
}
