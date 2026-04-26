import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers — Operating team + sub-village operators',
  description:
    'WebVillage is hiring an Operations Lead — the keystone full-time hire that runs daily-weekly cadence across the platform. Plus open operator slots across 14 verticals for the right humans.',
}

const ROLES = [
  {
    title: 'Operations Lead',
    type: 'Full-time',
    location: 'KL preferred · remote MY/SG OK',
    compensation: 'RM 12–20K/mo + 1–2% equity + 5% rev-share (Y2–5) + performance bonus',
    summary:
      'The keystone hire. Closes operating loops daily-weekly while the founder handles strategy, product, and major decisions. Reports to founder.',
    owns: [
      'Daily / weekly operating cadence — pipeline status, blockers, KPI dashboards, vendor coordination',
      'SME village ops — recruitment, vetting, matching, payouts, quality control until a Community Lead is hired',
      'Sales and BD pipeline qualification (inbound + early outbound) until BD is hired',
      'Cross-vertical coordination — connecting sub-village operators across the 14 verticals',
      'Vendor and contractor management',
      'Founder interface for all platform-level operating decisions',
    ],
    profile: [
      '5–10 years operating SaaS, marketplace, or platform business',
      'Bias to action; comfortable closing loops without instruction',
      'Native AI tool user — expected to use Claude and agentic tools to multiply output 5×',
      'MY / SG market familiarity (cross-border experience helpful)',
      'Can write specs, run meetings, build operating cadence from scratch',
      'Equity-comfortable; founder-stage, not Series B',
    ],
    notForYou: [
      'You want to be co-founder — three vehicles already exist; this is COO-equivalent',
      'Pure agency background with no platform / SaaS exposure',
      "You don't use AI tools natively in your daily work",
      'You want traditional W-2 stability over founder-stage upside',
    ],
    timeline: [
      {
        day: 'Day 30',
        items: [
          'Full inventory of existing operations across all sub-villages',
          'Decision log + budget tracker + KPI dashboard live',
          'Daily / weekly cadence with founder established',
          '2 quick wins shipped',
        ],
      },
      {
        day: 'Day 60',
        items: [
          'SME village MVP operational (application + vetting + matching)',
          'Sales pipeline with 5+ qualified leads',
          'One sub-village operating fully without founder involvement',
          'Cross-vertical KPI report shipped weekly',
        ],
      },
      {
        day: 'Day 90',
        items: [
          '3+ paying clients or pilot agreements on the platform',
          'Tech Lead retainer signed',
          'Community Lead candidate pipeline opened',
          'Founder spending under 10 hours / week on WebVillage ops',
        ],
      },
    ],
    apply: 'careers@webvillage.com',
    status: 'OPEN — Phase 0 hire',
  },
  {
    title: 'Tech Lead — Fractional',
    type: 'Fractional · 2 days/week retainer',
    location: 'Remote',
    compensation: 'Retainer + equity (negotiated by candidate)',
    summary:
      'Owns architecture decisions, code quality across the engine packages, and Stage 1 build sequencing. Phase 1 hire; engaged once the Operations Lead is in place.',
    owns: [
      'Architecture review for the 6-layer platform (engine, agents, flows, marketplace, network, operating discipline)',
      'Build sequencing across Stage 1 milestones (Tool tier, onboarding, Brand Engine, billing)',
      'Code review on all production-bound work; mentor for contractors',
      'Vendor / partner technical evaluation (Vista Social, Ayrshare, Respondology)',
    ],
    profile: [
      '10+ years building SaaS / multi-tenant platforms',
      'Comfortable with Next.js, TypeScript, Postgres / Supabase, monorepo tooling',
      'Has shipped at least one product from zero to revenue',
      'Comfortable working fractional alongside other engagements',
    ],
    notForYou: [],
    timeline: [],
    apply: 'careers@webvillage.com',
    status: 'OPEN — Phase 1 hire (gated on Ops Lead)',
  },
  {
    title: 'Community / SME Lead',
    type: 'Rev-share start → Part-time → Full-time',
    location: 'Remote',
    compensation: 'Rev-share initially; transitions to FT comp at scale',
    summary:
      'Runs the SME village once the Operations Lead has the operating cadence in place. Recruitment, vetting, matching, retention, payouts, quality control across verticals.',
    owns: [
      'Founding-expert outreach and onboarding',
      'Quality control on expert deliverables; rubric and feedback loops',
      'Expert payouts (per piece + retainer) via Stripe Connect',
      'Editor and reviewer recruitment as Editorial-tier client volume grows',
    ],
    profile: [
      'Marketplace ops or community-management background',
      'Empathetic with both expert and client sides; good written communicator',
      'Comfortable with rev-share start; founder-stage temperament',
    ],
    notForYou: [],
    timeline: [],
    apply: 'careers@webvillage.com',
    status: 'OPEN — Phase 2 hire (Months 6–12)',
  },
]

const SUB_VILLAGE_SLOTS = [
  {
    name: 'Member Directories (V1)',
    domain: 'webvillage.com',
    fit: 'Directory-product / B2B sales background; chambers and associations network',
  },
  {
    name: 'MathsTutor',
    domain: 'mathstutor.com',
    fit: 'Education / EdTech with curriculum chops; comfortable with subscription product',
  },
  {
    name: 'WineTravelGuides',
    domain: 'winetravelguides.com',
    fit: 'Editorial publishing or wine industry; affiliate / content monetisation experience',
  },
  {
    name: 'NerdSmith',
    domain: 'nerdsmith.com',
    fit: 'AI builder community management; technical content editing',
  },
  {
    name: 'TWELL (Startup OS)',
    domain: 'tinkerwell.com / hackjam.com',
    fit: 'MY / SG startup ecosystem connector; programme management',
  },
  {
    name: 'HalalExpo',
    domain: 'halalexpo.com',
    fit: 'Halal supply chain / certification industry connections',
  },
  {
    name: 'Other dormant verticals',
    domain: 'TutorDN · CTOCoach · IndieBuilder · MyTakaful · PAXA · DirectoryReady · HackJam',
    fit: 'Domain expert with operator instinct; comfortable taking a built site to revenue',
  },
]

export default function CareersPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#F0FAF9] to-white pt-32 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Careers</p>
          <h1 className="mb-6 text-4xl font-bold text-[#1C2B28] sm:text-5xl">
            Operating team + sub-village operators
          </h1>
          <p className="text-lg text-[#6B7C79] sm:text-xl">
            WebVillage is founder-led with a substrate of 14 verticals already built. The keystone next move is an Operations Lead. Behind that, sub-village operator slots are open across most verticals — for humans who want to take a built surface to revenue.
          </p>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">Open roles</h2>
          <p className="mb-12 text-[#6B7C79]">
            Three operating roles staged across the next 12 months. Operations Lead is hiring now. Tech Lead and Community Lead open as the operating cadence stabilises.
          </p>

          <div className="space-y-12">
            {ROLES.map((role) => (
              <article key={role.title} className="rounded-xl border border-slate-200 bg-white p-8">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-2xl font-bold text-[#1C2B28]">{role.title}</h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    {role.status}
                  </span>
                </div>

                <dl className="mb-6 grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-[#6B7C79]">Type</dt>
                    <dd className="text-[#1C2B28]">{role.type}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#6B7C79]">Location</dt>
                    <dd className="text-[#1C2B28]">{role.location}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#6B7C79]">Compensation</dt>
                    <dd className="text-[#1C2B28]">{role.compensation}</dd>
                  </div>
                </dl>

                <p className="mb-6 text-[#1C2B28]">{role.summary}</p>

                <RoleSection title="What you'll own" items={role.owns} />

                {role.profile.length > 0 && (
                  <RoleSection title="Profile we're looking for" items={role.profile} />
                )}

                {role.notForYou.length > 0 && (
                  <RoleSection title="Profile we are NOT looking for" items={role.notForYou} muted />
                )}

                {role.timeline.length > 0 && (
                  <div className="mt-8">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">
                      30 / 60 / 90 day plan (finalised with you in week 1)
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {role.timeline.map((phase) => (
                        <div key={phase.day} className="rounded-lg border border-slate-200 bg-[#F0FAF9] p-4">
                          <h5 className="mb-3 font-bold text-[#0F766E]">{phase.day}</h5>
                          <ul className="space-y-2 text-sm text-[#1C2B28]">
                            {phase.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <a
                    href={`mailto:${role.apply}?subject=${encodeURIComponent(role.title + ' — application')}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#B45309]"
                  >
                    Apply via email
                    <span aria-hidden>&rarr;</span>
                  </a>
                  <span className="ml-3 text-sm text-[#6B7C79]">{role.apply}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sub-village operator slots */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold text-[#1C2B28]">Sub-village operator slots</h2>
          <p className="mb-10 max-w-3xl text-[#6B7C79]">
            Each vertical is a sub-village operated by a domain expert who takes the built surface to revenue. We provide the engine, design system, content tools, and operating discipline. You provide the domain expertise, the relationships, and the operator instinct. Compensation is rev-share-led with equity available at scale.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {SUB_VILLAGE_SLOTS.map((slot) => (
              <div key={slot.name} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-2 font-bold text-[#1C2B28]">{slot.name}</h3>
                <p className="mb-3 text-sm text-[#6B7C79]">
                  <span className="font-mono text-[#0F766E]">{slot.domain}</span>
                </p>
                <p className="text-sm text-[#1C2B28]">
                  <span className="font-semibold">Fit:</span> {slot.fit}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-[#1C2B28]">
              <span className="font-semibold">Interested in operating a sub-village?</span> Email{' '}
              <a
                className="text-[#D97706] underline-offset-2 hover:underline"
                href="mailto:careers@webvillage.com?subject=Sub-village%20operator%20interest"
              >
                careers@webvillage.com
              </a>{' '}
              with the vertical you have a fit for, two paragraphs on your domain experience, and a sentence on what would make this work for you commercially.
            </p>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-[#6B7C79] sm:px-6 lg:px-8">
          We respond to every email. If you don't hear back in 5 business days, please follow up.
        </div>
      </section>
    </div>
  )
}

function RoleSection({ title, items, muted = false }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div className="mt-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">{title}</h4>
      <ul className={`space-y-2 ${muted ? 'text-[#6B7C79]' : 'text-[#1C2B28]'}`}>
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-[#0F766E]">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
