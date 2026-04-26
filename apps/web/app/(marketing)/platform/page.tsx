import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Platform — 6 layers, 14 verticals',
  description:
    'WebVillage is one platform with six layers — site engine, AI agents, workflow systems, an SME village, network discovery, and operating discipline. Verticals are sub-villages that consume the platform.',
}

type LayerStatus = 'real' | 'partial' | 'aspirational' | 'forming'

const LAYERS: { num: number; name: string; description: string; status: LayerStatus; statusLabel: string }[] = [
  {
    num: 1,
    name: 'Site engine',
    description:
      'Shared Next.js packages, design system, deploy pipeline. @webvillage/engine, ui, db, auth, email, validation, config — extracted, builds pass, FindTraining consuming it.',
    status: 'real',
    statusLabel: 'Real',
  },
  {
    num: 2,
    name: 'Agent layer',
    description:
      'AI agents that do the work — content generation, SEO audit, code, ops, monitoring. Agents exist scattered across projects today; not yet unified or callable across surfaces.',
    status: 'partial',
    statusLabel: 'Partial',
  },
  {
    num: 3,
    name: 'Systems / flows',
    description:
      'Workflow orchestration that routes tasks between agents and humans. Playbooks and skills exist as docs; programmatic orchestration of AI ↔ SME routing is on the roadmap.',
    status: 'aspirational',
    statusLabel: 'Aspirational',
  },
  {
    num: 4,
    name: 'SME marketplace (the village)',
    description:
      'Curated, vetted subject-matter experts organised into sub-villages by vertical. Application, vetting, matching, payouts, quality control. Substrate exists across 14 verticals; operating layer forming.',
    status: 'forming',
    statusLabel: 'Forming',
  },
  {
    num: 5,
    name: 'Network',
    description:
      'Cross-site discovery — meta-directory, cross-project SEO, network effects. Designed in the chamber pitch and Mode 3 REST API; webvillage.com is the intended hub but not yet the discovery surface.',
    status: 'aspirational',
    statusLabel: 'Aspirational',
  },
  {
    num: 6,
    name: 'Operating discipline',
    description:
      'Specs, registries, agent definitions, session protocols, kill criteria, audit cadences. Codified in the command-center: project index, agent registry, env registry, credentials master, kill criteria, playbooks, lessons.',
    status: 'real',
    statusLabel: 'Real',
  },
]

type VerticalRow = {
  num: number
  name: string
  description: string
  domain: string
  surface: string
  operator: string
  revenue: string
}

const LIVE_VERTICALS: VerticalRow[] = [
  {
    num: 1,
    name: 'Member Directories',
    description: 'Done-for-you member directories for chambers, associations, and industry bodies.',
    domain: 'webvillage.com + per-client subdomains',
    surface: 'webvillage.com live; FindTraining deployed',
    operator: 'Slot open',
    revenue: 'Managed service ($2.5K–$10K setup + $299–$999/mo) + self-serve embed',
  },
  {
    num: 2,
    name: 'MathsTutor',
    description: 'IGCSE and GCSE math AI tutor for students and parents.',
    domain: 'mathstutor.com',
    surface: 'Live, paying subscribers',
    operator: 'Slot open',
    revenue: 'Subscription',
  },
  {
    num: 3,
    name: 'WineTravelGuides',
    description: 'Editorial publishing on wine, travel, and the regions where they overlap.',
    domain: 'winetravelguides.com',
    surface: 'Live, organic traffic',
    operator: 'Slot open',
    revenue: 'Affiliate + content',
  },
  {
    num: 4,
    name: 'Money.com.my',
    description: 'Malaysia personal finance education.',
    domain: 'money.com.my',
    surface: 'Live (Phase 1)',
    operator: 'Per-guide editor (slot open)',
    revenue: 'Education / publishing',
  },
  {
    num: 5,
    name: 'NerdSmith',
    description: 'AI-builder content, founders cohort, and tooling.',
    domain: 'nerdsmith.com',
    surface: 'Live founding cohort',
    operator: 'Slot open (human editor needed)',
    revenue: 'Cohort / publishing',
  },
  {
    num: 6,
    name: 'TWELL',
    description: 'Malaysia / Singapore startup ecosystem operating system.',
    domain: 'tinkerwell.com / hackjam.com',
    surface: 'Live infra, 5K+ startups + 1K+ investors seeded',
    operator: 'Slot open',
    revenue: 'Builder Programme + Startup OS tiers',
  },
]

const BUILT_VERTICALS: VerticalRow[] = [
  {
    num: 7,
    name: 'TutorDN',
    description: 'Tutor marketplace.',
    domain: 'tutordn.com',
    surface: 'Built, dormant',
    operator: 'Slot open',
    revenue: 'TBD',
  },
  {
    num: 8,
    name: 'CTOCoach',
    description: 'Engineering leadership coaching and content.',
    domain: 'ctocoach.com',
    surface: 'Built, dormant',
    operator: 'Slot open',
    revenue: 'TBD',
  },
  {
    num: 9,
    name: 'HalalExpo',
    description: 'Halal supplier directory.',
    domain: 'halalexpo.com',
    surface: 'Built, payment integration pending',
    operator: 'Slot open',
    revenue: 'Listings / directory',
  },
  {
    num: 10,
    name: 'IndieBuilder',
    description: 'Maker community.',
    domain: 'indiebuilder.com',
    surface: 'Built, dormant',
    operator: 'Slot open',
    revenue: 'TBD',
  },
]

const SCAFFOLDED_VERTICALS: VerticalRow[] = [
  {
    num: 11,
    name: 'HackJam',
    description: 'Developer talent.',
    domain: 'hackjam.com',
    surface: 'MVP built, DNS pending',
    operator: 'Slot open',
    revenue: 'TBD',
  },
  {
    num: 12,
    name: 'MyTakaful',
    description: 'Takaful (Islamic insurance) literacy.',
    domain: 'mytakaful.com',
    surface: 'Phase 1A complete',
    operator: 'Slot open',
    revenue: 'TBD',
  },
  {
    num: 13,
    name: 'PAXA',
    description: 'Signal and outreach platform.',
    domain: 'paxa.com',
    surface: 'Scaffolded',
    operator: 'Slot open',
    revenue: 'TBD',
  },
  {
    num: 14,
    name: 'DirectoryReady',
    description: 'Directory tooling.',
    domain: 'directoryready.com',
    surface: 'Phase 0 content',
    operator: 'Slot open',
    revenue: 'TBD',
  },
]

const STATUS_STYLES: Record<LayerStatus, string> = {
  real: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border border-amber-200',
  forming: 'bg-amber-50 text-amber-700 border border-amber-200',
  aspirational: 'bg-slate-50 text-slate-600 border border-slate-200',
}

export default function PlatformPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#F0FAF9] to-white pt-32 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">The Platform</p>
          <h1 className="mb-6 text-4xl font-bold text-[#1C2B28] sm:text-5xl">
            One platform. Six layers. Fourteen verticals.
          </h1>
          <p className="text-lg text-[#6B7C79] sm:text-xl">
            WebVillage is structured as a platform — shared engine, agents, workflows, expert village, network, and operating discipline. Verticals are sub-villages that consume the platform. The defensible position is having all six layers, not one or two.
          </p>
        </div>
      </section>

      {/* The 6 layers */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">The 6-layer architecture</h2>
          <p className="mb-12 text-[#6B7C79]">
            Honest grade: 2 layers fully real, 2 partial, 2 aspirational. Public copy never overstates layers 3, 4, or 5 as production-ready today.
          </p>

          <div className="space-y-4">
            {LAYERS.map((layer) => (
              <div key={layer.num} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F0FAF9] text-lg font-bold text-[#0F766E]">
                      {layer.num}
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-[#1C2B28]">{layer.name}</h3>
                      <p className="max-w-3xl text-[#6B7C79]">{layer.description}</p>
                    </div>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[layer.status]}`}
                  >
                    {layer.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 14 verticals */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">The 14 verticals</h2>
          <p className="mb-10 max-w-3xl text-[#6B7C79]">
            Each vertical is operated as a sub-village, with its own domain, surface, operator (or operator slot), and revenue mode. All 14 currently have zero active human operators outside the founder — recruiting an Ops Lead is the keystone hire that unlocks the rest.
          </p>

          <VerticalGroup title="Live or substrate-built" verticals={LIVE_VERTICALS} />
          <VerticalGroup title="Built, not yet shipped" verticals={BUILT_VERTICALS} />
          <VerticalGroup title="Scaffolded / spec" verticals={SCAFFOLDED_VERTICALS} />
        </div>
      </section>

      {/* Founding sub-village */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">Vertical 0 — WebVillage Editorial</h2>
          <p className="mb-6 text-[#6B7C79]">
            The founding sub-village. Content marketing and brand management as a managed service, blending AI volume with human taste. Editorial Lite to Enterprise tiers, with the WebVillage Brand Engine as the lock-in mechanism at mid-tier and above. The substrate that proved the model is itself running on the platform.
          </p>
          <p className="text-[#6B7C79]">
            <a href="/directories" className="font-semibold text-[#0F766E] underline-offset-2 hover:underline">
              Vertical 1 — Member Directories &rarr;
            </a>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-200 bg-[#F0FAF9] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-[#1C2B28]">
            Want to talk about your brand or your industry vertical?
          </h2>
          <p className="mb-8 text-[#6B7C79]">
            We work with brands at the editorial layer (V0) and chambers / associations at the directory layer (V1). Other verticals open as operators come online.
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

function VerticalGroup({ title, verticals }: { title: string; verticals: VerticalRow[] }) {
  return (
    <div className="mb-12 last:mb-0">
      <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {verticals.map((v) => (
          <div key={v.num} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h4 className="text-lg font-bold text-[#1C2B28]">
                <span className="mr-2 text-sm font-normal text-[#6B7C79]">{v.num}.</span>
                {v.name}
              </h4>
            </div>
            <p className="mb-4 text-sm text-[#6B7C79]">{v.description}</p>
            <dl className="space-y-1.5 text-sm">
              <DLRow label="Domain" value={v.domain} />
              <DLRow label="Surface" value={v.surface} />
              <DLRow label="Operator" value={v.operator} />
              <DLRow label="Revenue" value={v.revenue} />
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

function DLRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 flex-shrink-0 text-[#6B7C79]">{label}</dt>
      <dd className="text-[#1C2B28]">{value}</dd>
    </div>
  )
}
