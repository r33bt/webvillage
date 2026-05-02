import Link from 'next/link'
import { Section } from './components/Section'
import { PricingCard } from './components/PricingCard'

export const metadata = {
  title: 'BrandHacker — One brand. Every surface.',
  description:
    'The source of truth for your brand. Upload once. Your team, your AI, your social, your web — all stay on-brand by default.',
  alternates: {
    canonical: '/',
  },
}

const PROBLEMS = [
  {
    surface: 'Web',
    body:
      'Your homepage says one thing. Your about page says another. Footnotes from a 2024 deck still live in the meta description.',
  },
  {
    surface: 'Social',
    body:
      'LinkedIn, X, and Instagram each carry a slightly different voice — because three different people (or three different prompts) wrote them.',
  },
  {
    surface: 'AI engines',
    body:
      'ChatGPT, Claude, and Perplexity already cite your brand. The facts they return are drawn from whatever they happened to scrape — not from anything you control.',
  },
  {
    surface: 'B2B directories',
    body:
      'Listings on chamber sites, training catalogues, and industry indexes still show last year\'s positioning. You don\'t remember which ones, and nobody is checking.',
  },
]

const SURFACES = [
  {
    name: 'Web',
    body:
      'JSON-LD, OpenGraph tags, and an on-brand about-page draft — generated from the same source of record. Copy-paste snippets for your existing site, or hosted by us.',
  },
  {
    name: 'Social',
    body:
      'Drafts that pass a 5-pillar quality rubric and a banned-phrases gate before they reach your queue. Same source of record, four platform-native variants.',
  },
  {
    name: 'AI engines',
    body:
      'A `/llms.txt` file and a richer `/.well-known/brand.json`. When a model fetches your brand, it sees what you decided it should see — not what it inferred.',
    highlighted: true,
  },
]

const STEPS = [
  { n: '1', label: 'Voice', body: 'Audience, tone, signature phrases, what you never want to sound like.' },
  { n: '2', label: 'Tokens', body: 'Colours, typography, spacing — the visual half of the source of record.' },
  { n: '3', label: 'Brand facts', body: 'Mission, founders, products, FAQ, key claims. The things AI models keep getting wrong.' },
  { n: '4', label: 'First draft', body: 'A piece of content scored against your voice profile. You see the rubric, not just the output.' },
  { n: '5', label: 'Done', body: 'Surfaces light up — web snippets, social drafts, AEO files. Under five minutes end-to-end.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* HERO */}
      <section className="px-6 sm:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            In development
          </div>

          <h1 className="mt-8 text-5xl sm:text-7xl font-semibold tracking-tight text-zinc-50">
            One brand.
            <br />
            Every surface.
          </h1>

          <p className="mt-6 max-w-2xl text-xl sm:text-2xl text-zinc-300 leading-relaxed">
            Brand consistency without the overhead.
          </p>

          <p className="mt-8 max-w-2xl text-base text-zinc-400 leading-relaxed">
            One source of record for your voice, your tokens, and your brand facts —
            then web, social, and AI engines stay aligned without anyone editing
            three things in three places.
          </p>

          <div className="mt-12 flex flex-wrap gap-4 items-center">
            <Link
              href="/pat/llms.txt"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              See the live AEO surface
              <span aria-hidden>→</span>
            </Link>
            <span className="text-sm text-zinc-400">
              A real `/llms.txt` for a real brand.
            </span>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section
        eyebrow="The drift"
        heading="Your brand says four different things, depending on where you look."
        intro="Every surface drifts on a different timeline. The fixes don't scale, and neither does the patience for them."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {PROBLEMS.map((p) => (
            <div
              key={p.surface}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-6"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                {p.surface}
              </div>
              <p className="mt-3 text-zinc-300 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* PRODUCT — 3 SURFACES */}
      <Section
        eyebrow="The product"
        heading="Three surfaces. One source of record."
        intro="You define the brand once. Each surface generates from the same place."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {SURFACES.map((s) => (
            <div
              key={s.name}
              className={`rounded-lg border p-6 ${
                s.highlighted
                  ? 'border-zinc-300 bg-zinc-900/60'
                  : 'border-zinc-800 bg-zinc-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-50">{s.name}</h3>
                {s.highlighted ? (
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-300">
                    Unclaimed lane
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Live demo
          </div>
          <p className="mt-3 text-zinc-300 leading-relaxed">
            The AI surface is already running. These are real files, served from this domain:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                href="/pat/llms.txt"
                className="text-zinc-50 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-300 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
              >
                /pat/llms.txt
              </Link>
              <span className="text-zinc-400"> — the emerging AI-crawler standard</span>
            </li>
            <li>
              <Link
                href="/pat/.well-known/brand.json"
                className="text-zinc-50 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-300 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
              >
                /pat/.well-known/brand.json
              </Link>
              <span className="text-zinc-400"> — the BrandHacker-native schema</span>
            </li>
          </ul>
        </div>
      </Section>

      {/* AEO DIFFERENTIATOR */}
      <Section
        eyebrow="The AI engine angle"
        heading="When ChatGPT cites your brand, what does it actually say?"
        narrow
      >
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            With BrandHacker, you decide. We publish a <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">/llms.txt</code> for emerging AI crawlers, and a richer{' '}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-200">/.well-known/brand.json</code>{' '}
            for systems that want structured brand data — facts, voice, banned phrases, FAQ, last-updated stamp.
          </p>
          <p>
            Most brands aren&apos;t serving these yet. The lane is open for the
            next 12 to 18 months — long enough to be the source models pull from
            instead of one of a dozen scraped pages.
          </p>
          <p className="text-zinc-400 text-sm">
            Your voice profile, your brand facts, your decision about what
            outsiders see. Updated when you update — not when the next model
            re-crawls.
          </p>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section
        eyebrow="How it works"
        heading="Five steps. Under five minutes."
        intro="Set up the source of record once. Surfaces generate from there."
      >
        <ol className="space-y-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex gap-5 rounded-lg border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex-none w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300">
                {s.n}
              </div>
              <div>
                <div className="text-base font-medium text-zinc-50">{s.label}</div>
                <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* PRICING */}
      <Section
        eyebrow="Pricing"
        heading="Two tiers and a free trial."
        intro="No credit card on the trial. Cancel any time."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <PricingCard
            name="Free Trial"
            price="$0"
            period="/ 14 days"
            blurb="Full feature access. No card. Day-12 and day-14 nudge before it ends."
            ctaHref="/waitlist"
            ctaLabel="Get early access"
            features={[
              '1 brand',
              '50 drafts',
              'All web + social + AI surfaces',
              'No credit card required',
            ]}
          />
          <PricingCard
            name="Tool Starter"
            price="$99"
            period="/ month"
            blurb="One brand. The complete source-of-record + three surfaces."
            ctaHref="/waitlist"
            ctaLabel="Join waitlist"
            features={[
              '1 brand',
              '200 drafts / month',
              'Web · social · AI surfaces',
              'Calendar view',
              'Single channel publishing',
            ]}
          />
          <PricingCard
            name="Tool Pro"
            price="$249"
            period="/ month"
            blurb="Up to three brands, multi-channel publishing, AEO refresh + crawl monitoring."
            ctaHref="/waitlist"
            ctaLabel="Join waitlist"
            highlighted
            features={[
              'Up to 3 brands',
              '1,000 drafts / month',
              'About-page A/B variants',
              'Enriched schema.org JSON-LD',
              'AEO refresh schedule',
              'AEO crawl monitoring',
              'Team roles + audit log',
            ]}
          />
        </div>
      </Section>

      {/* DOGFOOD PROOF */}
      <Section
        eyebrow="Dogfood proof"
        heading="We run BrandHacker on our own brands first."
        narrow
      >
        <div className="space-y-6">
          <p className="text-zinc-300 leading-relaxed">
            Before we charge anyone, we run the system on four of our own brands —
            a regulated MENA fintech, an SA personal finance app, a global
            personal finance platform, and Pat-personal. If it can&apos;t hold a
            voice across those, it&apos;s not ready.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            The first sanitised case study lands{' '}
            <span className="text-zinc-50">2026-05-26</span> — same source of record,
            three surfaces, before-and-after on consistency.
          </p>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Case study — 2026-05-26
            </div>
            <Link
              href="/case-study/v22-multibrand"
              className="mt-3 block text-zinc-50 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-300 text-sm leading-relaxed focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              How a regulated financial-services brand consolidated voice, templates, and AI-engine canon onto BrandHacker →
            </Link>
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section narrow>
        <div className="text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-50">
            See the live AEO surface.
          </h2>
          <p className="text-zinc-300 leading-relaxed max-w-xl mx-auto">
            A real file, served from this domain, generated from a real source
            of record. The fastest way to see what BrandHacker actually does.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="/pat/llms.txt"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              See the live AEO surface
              <span aria-hidden>→</span>
            </Link>
            <a
              href="mailto:hello@brandhacker.com"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 hover:border-zinc-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              Or talk to us about WebVillage Editorial — we run BrandHacker for you
            </a>
          </div>
        </div>
      </Section>

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
