import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { getCalUrl } from '@/lib/env'

const calUrl = getCalUrl()
const heroCta = calUrl ? `${calUrl}?source=hero` : '/contact?source=hero'
const wedgeCta = calUrl ? `${calUrl}?source=wedge` : '/contact?source=wedge'
const directoryCta = calUrl ? `${calUrl}?source=directory` : '/contact?source=directory'
const footerCta = calUrl ? `${calUrl}?source=footer` : '/contact?source=footer'

// ── Section 2: 6 layers (the moat) ──────────────────────────────────────────

const LAYERS = [
  {
    num: 1,
    name: 'Site engine',
    blurb: 'Shared Next.js packages, design system, deploy pipeline. Every vertical ships on the same engine.',
  },
  {
    num: 2,
    name: 'AI agents',
    blurb: 'Content generation, SEO audit, code, ops, monitoring. Agents do the volume work.',
  },
  {
    num: 3,
    name: 'Workflow systems',
    blurb: 'Routing between AI and humans. Output passes through quality gates before it ships.',
  },
  {
    num: 4,
    name: 'Expert village',
    blurb: 'Vetted subject-matter experts organised by vertical. Humans do the judgment work.',
  },
  {
    num: 5,
    name: 'Network',
    blurb: 'Cross-vertical discovery. Each new vertical strengthens the others.',
  },
  {
    num: 6,
    name: 'Operating discipline',
    blurb: 'Specs, registries, audit cadences, kill criteria. The rules of how things ship.',
  },
]

// ── Section 3: V0 Editorial capability tiles ────────────────────────────────

const V0_CAPABILITIES = [
  {
    title: 'Content creation',
    blurb:
      'YMYL articles, persona-led editorial, video, image — fact-checked, 5-pillar scored, never AI-shipped-untouched.',
  },
  {
    title: 'Publishing',
    blurb:
      'Calendar + multi-platform scheduling. Hand-off mode (you post) or connected (we post for you).',
  },
  {
    title: 'Brand monitoring',
    blurb:
      'Curated weekly insight reports — mentions, sentiment, share of voice, competitor moves. Human judgment, not commodity dashboards.',
  },
  {
    title: 'Social media management',
    blurb:
      "1-hour response SLA on inbound. AI-suggested replies, human-approved. The pain Hootsuite and Sprout don't solve.",
  },
]

// ── Section 4: Verticals (live proof) ───────────────────────────────────────

const VERTICALS = [
  {
    name: 'MathsTutor.com',
    domain: 'mathstutor.com',
    blurb: 'IGCSE math AI tutor. Live with paying subscribers.',
  },
  {
    name: 'WineTravelGuides.com',
    domain: 'winetravelguides.com',
    blurb: 'Wine travel publishing. Live with organic traffic.',
  },
  {
    name: 'Money.com.my',
    domain: 'money.com.my',
    blurb: 'Malaysian personal finance education. Live, persona-led editorial.',
  },
  {
    name: 'NerdSmith',
    domain: 'nerdsmith.com',
    blurb: 'AI builder content + cohort. Live founding cohort.',
  },
  {
    name: 'TWELL',
    domain: 'tinkerwell.com / hackjam.com',
    blurb: 'MY/SG startup ecosystem OS. Live infrastructure, 5,000+ startups seeded.',
  },
  {
    name: 'FindTraining.com',
    domain: 'findtraining.com',
    blurb: 'Malaysia HRDF training providers. Live on the engine.',
  },
]

// ── Metadata ────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'WebVillage — AI agents + expert village for digital work at scale',
  description:
    'AI agents handle volume. A vetted village of subject-matter experts handles the work that needs taste. Six layers, fourteen verticals.',
}

const homepageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WebVillage',
  url: 'https://webvillage.com',
  description:
    'Hybrid AI + expert platform for digital work at scale. Content, SEO, code, design, ops — at scale, with judgment.',
  potentialAction: {
    '@type': 'ContactAction',
    target: 'https://webvillage.com/contact',
  },
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-white">
      <JsonLd data={homepageSchema} />

      {/* Section 1 — Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0F766E] to-[#0C1A18] pb-24 pt-36 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-6 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            AI agents + expert village for digital work at scale.
          </h1>
          <p className="mb-3 max-w-3xl text-xl text-white/90 sm:text-2xl">
            Content, SEO, code, design, ops — at scale, with judgment.
          </p>
          <p className="mb-10 max-w-3xl text-lg text-white/70">
            AI agents handle volume. A vetted village of subject-matter experts handles the work that needs taste.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={heroCta}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#B45309]"
            >
              Talk to us about your brand
              <span aria-hidden>&rarr;</span>
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Section 2 — The 6 layers (the moat) */}
      <section className="border-b border-slate-200 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 max-w-3xl text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            The platform is six layers deep.
          </h2>
          <p className="mb-12 max-w-3xl text-lg text-[#6B7C79]">
            Most platforms have one or two of these. Fiverr and Upwork are humans-only. Replit and Lovable are AI-only. WebVillage is built on all six — that's the scale, that's the moat.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LAYERS.map((layer) => (
              <div key={layer.num} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0FAF9] font-bold text-[#0F766E]">
                    {layer.num}
                  </span>
                  <h3 className="text-lg font-bold text-[#1C2B28]">{layer.name}</h3>
                </div>
                <p className="text-[#6B7C79]">{layer.blurb}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-3xl text-sm italic text-[#6B7C79]">
            Layers 1, 2, and 6 are production today. Layers 3, 4, and 5 are forming.{' '}
            <Link href="/platform" className="text-[#0F766E] underline-offset-2 hover:underline">
              See the full architecture &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* Section 3 — V0 WebVillage Editorial */}
      <section className="bg-[#F0FAF9] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">
            Vertical 0 — WebVillage Editorial
          </p>
          <h2 className="mb-6 max-w-3xl text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            Content marketing and brand management, methodology-first.
          </h2>
          <div className="mb-12 max-w-3xl space-y-4 text-lg text-[#1C2B28]">
            <p>
              AI content has become commodity. Anyone can produce it; almost no point publishing it. We use AI as leverage but keep real humans accountable for every piece of work that ships — articles, video, images, social, brand monitoring.
            </p>
            <p>
              Built by humans, AI-leveraged, never shipped untouched. Brand-grade output, retainer pricing, named editor on every piece.
            </p>
          </div>

          <div className="mb-10 grid gap-5 sm:grid-cols-2">
            {V0_CAPABILITIES.map((cap) => (
              <div key={cap.title} className="rounded-xl bg-white p-6">
                <h3 className="mb-3 text-lg font-bold text-[#1C2B28]">{cap.title}</h3>
                <p className="text-[#6B7C79]">{cap.blurb}</p>
              </div>
            ))}
          </div>

          <div className="mb-10 rounded-xl border-2 border-[#0F766E]/30 bg-white p-8">
            <h3 className="mb-3 text-xl font-bold text-[#0F766E]">WebVillage Brand Engine</h3>
            <p className="text-[#1C2B28]">
              We train your brand into the platform — visual style, voice, editorial standards, your reviewer panel. Months of brand training compound. Switching off WebVillage doesn't lose ChatGPT — it loses <em>your</em> brand-trained AI and <em>your</em> curated experts.
            </p>
          </div>

          <p className="mb-8 text-sm text-[#6B7C79]">
            Self-serve from $99/mo (Tool tier) · Retainer from $599/mo (Editorial tier) · Enterprise from $15K+/mo.
          </p>

          <Link
            href={wedgeCta}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B45309]"
          >
            Talk to us about your brand
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Section 4 — Verticals (live proof) */}
      <section id="verticals" className="border-b border-slate-200 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 max-w-3xl text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            Already operating across six verticals.
          </h2>
          <p className="mb-12 max-w-3xl text-lg text-[#6B7C79]">
            The methodology is being tested in production across education, travel, finance, B2B directories, and developer communities. Each vertical is a sub-village operated on the WebVillage engine.
          </p>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VERTICALS.map((v) => (
              <article key={v.name} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-1 text-lg font-bold text-[#1C2B28]">{v.name}</h3>
                <p className="mb-3 font-mono text-xs text-[#0F766E]">{v.domain}</p>
                <p className="text-sm text-[#6B7C79]">{v.blurb}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 space-y-1 text-sm text-[#6B7C79]">
            <p>
              Eight more verticals scaffolded — tutoring, takaful literacy, halal supplier directories, developer talent, and others.{' '}
              <Link href="/platform" className="text-[#0F766E] underline-offset-2 hover:underline">
                See the full inventory &rarr;
              </Link>
            </p>
            <p className="italic">
              Operator slots open across all verticals — we're hiring.{' '}
              <Link href="/careers" className="text-[#0F766E] underline-offset-2 hover:underline">
                See open roles &rarr;
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 — Vertical 1 Member Directories */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">
            Vertical 1 — Member Directories
          </p>
          <h2 className="mb-6 max-w-3xl text-3xl font-bold text-[#1C2B28] sm:text-4xl">
            Member directories for chambers, associations, and industry bodies.
          </h2>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-6 text-lg text-[#1C2B28]">
                Done-for-you directory service for chambers, associations, and industry bodies. Cross-border B2B discovery — your members get found beyond your membership. Network effect built in.
              </p>
              <ul className="space-y-3 text-[#1C2B28]">
                {[
                  'Done-for-you setup, hosting, email',
                  'Cross-border discovery across the WebVillage network',
                  'Member self-service claim flow',
                  'Pricing: $2,500–$10K setup + $299–$999/mo',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="text-[#0F766E]">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="mb-3 text-xl font-bold text-[#1C2B28]">Run a chamber or association?</h3>
              <p className="mb-6 text-[#6B7C79]">
                30-min demo with your branding mockup. We show you what your directory looks like in the network.
              </p>
              <div className="space-y-3">
                <Link
                  href={directoryCta}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#D97706] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B45309]"
                >
                  Book a directory demo
                  <span aria-hidden>&rarr;</span>
                </Link>
                <Link
                  href="/directories/pricing"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-[#1C2B28] transition-colors hover:bg-slate-50"
                >
                  See full directory pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Methodology */}
      <section id="how-it-works" className="border-b border-slate-200 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-[#1C2B28] sm:text-4xl">How the work flows.</h2>

          <div className="space-y-8">
            <div>
              <h3 className="mb-2 text-xl font-bold text-[#0F766E]">AI does the volume.</h3>
              <p className="text-lg text-[#1C2B28]">
                Content drafts, SEO audits, code scaffolds, monitoring, image generation, structured-data work — all run by agents on the platform. They never ship to public surfaces without a human pass.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-[#0F766E]">Experts do the judgment.</h3>
              <p className="text-lg text-[#1C2B28]">
                Editorial review, technical accuracy, customer conversations, judgment calls on what's worth shipping — handled by the village. Subject-matter experts are vetted, scoped to a vertical, paid per output or on retainer.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-[#0F766E]">The engine + discipline make it ship.</h3>
              <p className="text-lg text-[#1C2B28]">
                Shared Next.js packages, deploy pipeline, registries, audit cadences. Every vertical ships on the same rails. Quality is enforced by the workflow, not by founder bandwidth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Origin */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-[#1C2B28]">Built on 10+ years of premium .com operations.</h2>
          <p className="text-lg text-[#6B7C79]">
            The methodology was built operating a premium .com portfolio on WordPress with content marketing and SEO over a decade. AI agents in 2024–26 made it productizable.
          </p>
        </div>
      </section>

      {/* Section 8 — Final CTA */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-white to-[#F0FAF9] py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-[#1C2B28] sm:text-4xl">Ready to talk?</h2>
          <p className="mb-10 text-lg text-[#6B7C79]">
            Whatever you're bringing — a brand to grow, a directory to run, an agency to partner with, or a question that doesn't fit a form — start here.
          </p>

          <Link
            href={footerCta}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#B45309]"
          >
            Talk to us
            <span aria-hidden>&rarr;</span>
          </Link>

          <p className="mt-8 text-sm text-[#6B7C79]">
            <span aria-hidden>·</span>{' '}
            <Link href="/careers" className="text-[#0F766E] underline-offset-2 hover:underline">
              Operator? See open roles &rarr;
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
