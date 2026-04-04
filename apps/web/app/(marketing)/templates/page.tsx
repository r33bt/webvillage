import Link from 'next/link'
import {
  Globe,
  Building2,
  Scale,
  Factory,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Use Cases — WebVillage',
  description:
    'See how WebVillage powers member directories for chambers of commerce, trade associations, professional bodies, and industry organisations.',
}

// ─── Data ───────────────────────────────────────────────────────────────────

const useCases = [
  {
    icon: Globe,
    title: 'Chamber of Commerce',
    tagline: 'Turn your chamber directory into a cross-border B2B discovery engine.',
    description:
      'Bilateral chambers exist to connect businesses across borders — but most directories are static PDFs or outdated WordPress plugins. WebVillage makes every member discoverable across all chamber nodes globally.',
    features: [
      'Member self-update portal',
      'Cross-border search across chamber network',
      'Sector and industry filtering',
      'Glue Up / CRM sync',
    ],
  },
  {
    icon: Building2,
    title: 'Trade Association',
    tagline: 'Give members the visibility they joined for.',
    description:
      'Members pay dues expecting to be found by buyers and partners. A buried spreadsheet directory doesn\'t deliver. WebVillage gives every member a searchable, SEO-optimised listing.',
    features: [
      'Category taxonomy with unlimited depth',
      'Claim and verify flow for members',
      'SEO-optimised page per listing',
      'Search, filter, and sort',
    ],
  },
  {
    icon: Scale,
    title: 'Professional Body',
    tagline: 'Help the public find verified professionals.',
    description:
      'Law societies, medical boards, and accounting bodies need to serve the public as much as their members. WebVillage displays credentials, verification badges, and areas of practice — so the right professional is always easy to find.',
    features: [
      'Credential and licence display',
      'Verification badges',
      'Area of practice filtering',
      'Public-facing search with trust signals',
    ],
  },
  {
    icon: Factory,
    title: 'Industry Body',
    tagline: 'Connect buyers and suppliers in your industry.',
    description:
      'Industry bodies sit on a goldmine of supplier data but rarely make it easy to search. WebVillage turns your membership list into a procurement tool — complete with product catalogues and featured placement.',
    features: [
      'Product and service catalogue per listing',
      'RFQ workflow (Phase 2)',
      'Featured and sponsored listing slots',
      'Industry-specific category filters',
    ],
  },
]

// ─── Page ───────────────────────────────────────────────────────────────────

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero */}
      <section className="px-4 pb-16 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Directories for every organisation type
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            See how WebVillage powers different kinds of member directories —
            from bilateral chambers to professional bodies and industry
            associations.
          </p>
        </div>
      </section>

      {/* Use Case Grid */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {useCases.map((useCase) => {
              const Icon = useCase.icon
              return (
                <div
                  key={useCase.title}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 transition-colors hover:border-neutral-700"
                >
                  {/* Icon + Title */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
                      <Icon className="h-5 w-5 text-teal-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {useCase.title}
                    </h2>
                  </div>

                  {/* Tagline */}
                  <p className="mb-3 text-base font-medium text-amber-400">
                    {useCase.tagline}
                  </p>

                  {/* Description */}
                  <p className="mb-6 text-sm leading-relaxed text-neutral-400">
                    {useCase.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {useCase.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-neutral-300"
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-800 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Don&apos;t see your organisation type?
          </h2>
          <p className="mb-8 text-lg text-neutral-400">
            WebVillage works for any membership organisation that needs a
            searchable, maintained directory. Let&apos;s talk about your use
            case.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-amber-400"
          >
            Book a discovery call
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
