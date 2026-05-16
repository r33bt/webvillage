import Link from 'next/link'
import { Section } from '../../components/Section'

export const metadata = {
  title: 'Case Study — Financial-services brand on BrandHacker',
  description:
    'A regulated financial-services brand moved its editorial substrate — voice profile, templates, banned phrases, brand facts, and AI-engine canon — onto BrandHacker.',
  alternates: {
    canonical: '/case-study/v22-multibrand',
  },
  openGraph: {
    title: 'Case Study — Financial-services brand on BrandHacker',
    description:
      'A regulated financial-services brand moved its editorial substrate — voice profile, templates, banned phrases, brand facts, and AI-engine canon — onto BrandHacker.',
    type: 'article',
    url: '/case-study/v22-multibrand',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Study — Financial-services brand on BrandHacker',
    description:
      'A regulated financial-services brand moved its editorial substrate onto BrandHacker.',
    images: ['/opengraph-image'],
  },
}

const SUBSTRATE_ITEMS = [
  {
    label: 'Voice profile',
    content: (
      <>
        A row in{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          wv_be_voice_profiles
        </code>
        . The profile holds audience definition, tone register, pillars, do&apos;s
        and don&apos;ts, signature phrases, and banned phrases. Versioned — every edit
        snapshots. Every draft is generated against a specific voice version, so an
        editor can answer &ldquo;which version of voice did this draft use&rdquo; three
        months later.
      </>
    ),
  },
  {
    label: 'Templates',
    content: (
      <>
        Rows in{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          wv_be_templates
        </code>
        . Canon templates — long-form article, cluster opener, single-platform post,
        lifecycle email, transactional email, factsheet. The templates are structured
        records: brief schema, draft schema, scoring schema, platform-delta schema.
        The content engine reads them; humans edit them; both reference the same row.
      </>
    ),
  },
  {
    label: 'Banned-phrases canon',
    content: (
      <>
        Phrases seeded into{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          wv_be_banned_phrases_canon
        </code>
        . Lifted from the brand&apos;s existing voice canon, extended with WV&apos;s
        portfolio anti-slop overlay (AI-slop tells, marketing-superlative slop, urgency
        tactics in lifecycle email, overconfident YMYL claims, narrative-dramatic
        register, managerial padding). The canon is enforced at draft time. Any draft
        containing a canon phrase fails Voice scoring outright.
      </>
    ),
  },
  {
    label: 'Design tokens',
    content: (
      <>
        Stored as{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          metadata jsonb
        </code>{' '}
        on{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          wv_be_clients
        </code>
        . Colours, typography, spacing scale, radii: one consistent shape per tenant.
      </>
    ),
  },
  {
    label: 'Brand facts',
    content: (
      <>
        Same{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          metadata jsonb
        </code>{' '}
        slot. Founded date, founders, mission, primary products, geographies, key claims,
        FAQ. The fields AI engines actually need to return correct answers when prospects
        ask about the brand.
      </>
    ),
  },
  {
    label: 'AEO surfaces',
    content: (
      <>
        Two outputs per tenant, generated from the substrate above: a{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          /llms.txt
        </code>{' '}
        for emerging AI crawlers, and a richer{' '}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
          /.well-known/brand.json
        </code>{' '}
        with voice signature, public banned phrases, FAQ, fact-check log, and
        last-updated timestamp. Belt-and-braces: the standard format covers any engine
        that respects the convention; the BrandHacker-native format covers brand-controlled
        fields the standard does not yet specify.
      </>
    ),
  },
]

const ARTICLE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline:
    'How a regulated financial-services brand consolidated voice, templates, and AI-engine canon onto BrandHacker',
  description:
    'A regulated financial-services brand moved its editorial substrate — voice profile, templates, banned phrases, brand facts, and AI-engine canon — onto BrandHacker.',
  datePublished: '2026-05-26',
  dateModified: '2026-05-26',
  author: {
    '@type': 'Person',
    name: 'Patrick Lee',
    url: 'https://app.brandhacker.com/pat/.well-known/brand.json',
  },
  publisher: {
    '@type': 'Organization',
    name: 'BrandHacker',
    url: 'https://app.brandhacker.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://app.brandhacker.com/opengraph-image',
    },
  },
  image: 'https://app.brandhacker.com/opengraph-image',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://app.brandhacker.com/case-study/v22-multibrand',
  },
}

export default function CaseStudyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSON_LD) }}
      />
      {/* HEADER */}
      <section className="px-6 sm:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-200 transition-colors mb-12 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
          >
            <span aria-hidden>←</span>
            Back
          </Link>

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Case study
          </div>

          <h1 className="mt-6 text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-50 leading-tight">
            How a regulated financial-services brand consolidated voice, templates,
            and AI-engine canon onto BrandHacker
          </h1>

          <div className="mt-8 flex items-center gap-4 text-sm text-zinc-400">
            <span>Patrick Lee</span>
            <span>·</span>
            <time dateTime="2026-05-26">2026-05-26</time>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 sm:px-8 border-t border-zinc-900">
        <div className="mx-auto max-w-3xl py-16">
          <div className="space-y-6 text-zinc-300 leading-relaxed">
            <p>
              A regulated financial-services brand moved its editorial substrate onto
              BrandHacker over the W3 to W4 window of our productization sprint. This
              is the write-up: what the brand looked like before, what BrandHacker
              actually provided, and what the live artefacts look like today.
            </p>
            <p>
              The brand is named here only as &ldquo;the brand.&rdquo; The substrate,
              schema, and live artefacts are real and verifiable on the dogfood tenant
              linked in the proof section.
            </p>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <Section
        eyebrow="The pain"
        heading="Brand drift across surfaces — and an AI-engine exposure."
        narrow
      >
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            A regulated financial-services brand with multiple customer-facing surfaces
            has one recurring problem.
          </p>
          <p>
            Brand voice drifts across surfaces. The website reads one way, the in-app
            copy reads another, the social feed reads a third, the transactional emails
            read a fourth. The team is fine. The tooling is fine. The drift is what
            happens when six surfaces share zero source of truth.
          </p>
          <p>
            There is a compounding problem: AI engines. When a prospect asks ChatGPT,
            Claude, or Perplexity about the brand, those engines pull from whatever they
            can find. About-page copy. Old press hits. Investor decks. Mismatched
            LinkedIn bios. The brand has zero direct say in what the engines return.
            For a regulated brand, &ldquo;wrong fact returned by an AI engine&rdquo; is
            not a marketing nuisance. It is a compliance exposure.
          </p>
          <p>
            Everything is written down somewhere. The problem is everything is written
            down somewhere different.
          </p>
        </div>
      </Section>

      {/* PRE-BH */}
      <Section
        eyebrow="Before BrandHacker"
        heading="What the brand had — and what it was missing."
        narrow
      >
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            Worth being precise here, because BrandHacker did not arrive into a vacuum.
            The brand had real editorial infrastructure already.
          </p>

          <ul className="space-y-4">
            {[
              {
                term: 'A formal voice canon.',
                def: 'A long-form, dated, versioned tone-of-voice document, treated internally as the authoritative source on any divergence with the style guide.',
              },
              {
                term: 'A content style guide.',
                def: 'UK English conventions, brand-specific spellings, document structure rules, right-vs-wrong examples.',
              },
              {
                term: 'Mechanical rules.',
                def: "A short, codified set of brand-name, banned-phrase, and document-structure rules used as a pre-publish checklist.",
              },
              {
                term: 'A multi-stage content production system.',
                def: 'Production stages for URL architecture, FAQ allocation, internal linking, brief templates, title optimisation, brief assembly, content generation, and media enrichment that had already shipped at scale.',
              },
              {
                term: 'A transactional email pattern library.',
                def: "Same voice canon applied across the customer lifecycle.",
              },
            ].map(({ term, def }) => (
              <li key={term} className="flex gap-3">
                <span className="text-zinc-500 flex-none">—</span>
                <span>
                  <strong className="text-zinc-50 font-medium">{term}</strong> {def}
                </span>
              </li>
            ))}
          </ul>

          <p>
            So this was not a &ldquo;we have nothing, please help&rdquo; engagement.
            The brand&apos;s editorial discipline was mature.
          </p>
          <p>What it did not have:</p>

          <ol className="space-y-4 list-none">
            {[
              {
                n: '1.',
                term: 'A single source of truth.',
                def: "The voice canon lived in one repo, the style guide in another, the mechanical rules in a third, and the brand facts were scattered across pitch decks, about-pages, and investor briefs. Every surface team referenced \"the docs\" but no two teams referenced the same docs.",
              },
              {
                n: '2.',
                term: 'A formal anti-slop layer.',
                def: null,
                custom: (
                  <>
                    Articles shipping at scale, but no documented
                    Provenance/Specificity/Voice/Utility scoring rubric applied at
                    production time. Quality reviewers caught issues; the rubric for{' '}
                    <em>what counts as an issue</em> was not written down.
                  </>
                ),
              },
              {
                n: '3.',
                term: 'No AI-engine surface at all.',
                custom: (
                  <>
                    Zero{' '}
                    <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
                      /llms.txt
                    </code>
                    . Zero{' '}
                    <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
                      /.well-known/brand.json
                    </code>
                    . Zero schema.org JSON-LD beyond what came stock with the website
                    framework. AI engines were already returning facts about the brand to
                    prospects, and none of the engines had a brand-controlled canon to
                    read from.
                  </>
                ),
              },
            ].map(({ n, term, def, custom }) => (
              <li key={n} className="flex gap-3">
                <span className="text-zinc-500 flex-none font-medium">{n}</span>
                <span>
                  <strong className="text-zinc-50 font-medium">{term}</strong>{' '}
                  {custom ?? def}
                </span>
              </li>
            ))}
          </ol>

          <p>
            The third gap is the one that kept coming up. The first two are &ldquo;fix
            the filing cabinet.&rdquo; The third is that the filing cabinet is also
            being read by AI engines, and right now they are reading whatever they found.
          </p>
        </div>
      </Section>

      {/* SUBSTRATE */}
      <Section
        eyebrow="The BrandHacker substrate"
        heading="One source of record. Every surface reads from it."
        narrow
      >
        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <div className="space-y-6">
            <p>
              BrandHacker is built around one idea: a brand has a single canonical
              record, and every surface where the brand shows up reads from that record.
              Voice. Templates. Banned phrases. Design tokens. Brand facts. AI-engine
              canon. One filing cabinet, one location, every drawer labelled.
            </p>
            <p>Concretely, here is what was seeded during W3:</p>
          </div>

          <div className="space-y-8">
            {SUBSTRATE_ITEMS.map(({ label, content }) => (
              <div key={label} className="border-l border-zinc-800 pl-6">
                <h3 className="text-base font-semibold text-zinc-50 mb-3">{label}</h3>
                <p>{content}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* PROOF */}
      <Section eyebrow="The proof" heading="The substrate is verifiable today." narrow>
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            The brand&apos;s AEO surfaces are pre-launch internal — the substrate is in
            place, the artefacts are generated, but they go public on the brand&apos;s
            own infrastructure on the brand&apos;s timing, not BrandHacker&apos;s.
          </p>
          <p>
            What is verifiable today is the dogfood tenant. Pat-personal sits in{' '}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">
              wv_be_clients
            </code>{' '}
            and runs through the same code path as every other tenant. Voice profile,
            templates, brand facts, AEO surfaces: same substrate, different tenant.
          </p>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Live today
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/pat/llms.txt"
                  className="text-zinc-50 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-300 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                >
                  /pat/llms.txt
                </a>
                <span className="text-zinc-400"> — the emerging AI-crawler standard</span>
              </li>
              <li>
                <a
                  href="/pat/.well-known/brand.json"
                  className="text-zinc-50 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-300 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                >
                  /pat/.well-known/brand.json
                </a>
                <span className="text-zinc-400"> — BrandHacker-native schema, richer fields</span>
              </li>
            </ul>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Same code path. Same schema version. Same voice-profile-versioning
              behaviour. The only difference is the tenant slug and the brand-facts
              payload.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We track which AI engines fetch these files and how often — that is
              the crawl-frequency metric. Citation quality: whether the engines
              changed what they return about the brand when prospects ask
              questions. That comparison is the Q3 report.
            </p>
          </div>
        </div>
      </Section>

      {/* WV EDITORIAL */}
      <Section eyebrow="The service layer" heading="Where WebVillage Editorial fits." narrow>
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            BrandHacker is the product. It is the substrate, the surfaces, the gates,
            the audit log. Self-serve. $99/month Starter, $249/month Pro, 14-day
            trial.
          </p>
          <p>
            WebVillage Editorial is the optional managed-service tier on top. Built by
            humans, AI-leveraged, never shipped untouched. Available for brands that want:
          </p>
          <ul className="space-y-3">
            {[
              'A human review of every published piece against the 5-pillar rubric, before it goes live, not after',
              "A 1-hour SLA on inbound on the brand's social surfaces during business hours",
              'Editorial calendar ownership, not just calendar tooling',
              "Editorial production by experts who have shipped for the brand's category before",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-zinc-500 flex-none">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-400">
            Clean line: the product handles the substrate; the service handles the
            judgment. A brand can have either, both, or neither, depending on their
            stage.
          </p>
        </div>
      </Section>

      {/* NEXT */}
      <Section eyebrow="What is next" heading="External tenants." narrow>
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            For BrandHacker as a product, the next eight weeks are about external
            tenants. The substrate is proven on the dogfood tenant; the engagement
            above runs the same substrate at a more demanding scale. The next step is
            the first paying tenants on the public trial.
          </p>
          <p>
            If your brand has the same shape as this one — multiple surfaces, drift
            between them, AI engines returning facts you did not write — the substrate
            is available.{' '}
            <Link
              href="/waitlist"
              className="text-zinc-50 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-300 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              14-day free trial
            </Link>
            , no credit card.
          </p>

          <div className="pt-4">
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              Get early access
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Section>

      {/* BYLINE */}
      <section className="px-6 sm:px-8 py-16 border-t border-zinc-900">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-zinc-400 leading-relaxed italic">
            Patrick Lee is the founder and operator of BrandHacker and WebVillage
            Editorial. The brand engagement described above is sanitised: the brand,
            market, and product specifics are abstracted to keep the engagement
            confidential. The substrate, schema, and live artefacts are real and
            verifiable on the dogfood tenant linked above.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 sm:px-8 py-12 border-t border-zinc-900">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row justify-between gap-4 text-sm text-zinc-400">
          <div>One brand. Every surface.</div>
          <div>© 2026 · BrandHacker.</div>
        </div>
      </footer>
    </main>
  )
}
