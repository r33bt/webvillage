import { Metadata } from 'next'
import { Star, Award, TrendingDown } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { FoundingFormCard, FaqSection } from './FoundingForm'

// Force dynamic so slot count reflects real submissions, not a stale build snapshot
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Founding Member — List Your Company | FindTraining',
  description: "Be first on Malaysia's HRDF training directory. 30 founding slots at RM 100/mo for 3 months — top placement, founding badge, and early access.",
  alternates: { canonical: 'https://findtraining.com/founding' },
  robots: { index: false },
}

async function getFoundingCount(): Promise<number> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    const { count, error } = await supabase
      .from('ft_founding_members')
      .select('id', { count: 'exact', head: true })
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

const BENEFITS = [
  {
    icon: Star,
    title: 'Top Placement',
    description: 'Your profile appears above free listings from day one. When HR managers search by category or state, founding members surface first.',
  },
  {
    icon: Award,
    title: 'Founding Member Badge',
    description: 'A permanent badge on your profile showing you were among the first. Trust signals matter — HR managers choose providers they can verify.',
  },
  {
    icon: TrendingDown,
    title: 'RM 100/mo for 3 months',
    description: 'Founding price locked in before launch. After 3 months, Starter continues at RM 300/mo. You save 67% on your first quarter.',
  },
]

const TOTAL_SLOTS = 30

export default async function FoundingPage() {
  const foundingCount = await getFoundingCount()
  return (
    <>
      <section style={{ backgroundColor: '#0F6FEC' }} className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Limited — {TOTAL_SLOTS} founding slots
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Be First on FindTraining.<br className="hidden sm:block" /> Get Listed Before We Launch.
          </h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            We&apos;re building Malaysia&apos;s cleanest HRDF training directory. Founding members get top placement,
            a founding badge, and RM&nbsp;100/mo for 3 months — locked in before the price goes up.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">What founding members get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4" style={{ backgroundColor: '#0F6FEC1A' }}>
                  <Icon className="w-5 h-5" style={{ color: '#0F6FEC' }} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-md mx-auto">
          <FoundingFormCard foundingCount={foundingCount} totalSlots={TOTAL_SLOTS} />
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <FaqSection />
        </div>
      </section>
    </>
  )
}
