import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Monitor, Users, DollarSign, ShieldCheck, Briefcase, TrendingUp,
  Smile, BookOpen, Scale, Wrench, UtensilsCrossed, Stethoscope,
  Factory, HeartPulse, ArrowRight,
} from 'lucide-react'
import { getAllCategories } from '@webvillage/engine/adapters/supabase'
import type { FtCategory } from '@webvillage/engine/types/ft'

export const metadata: Metadata = {
  title: 'Training Categories — HRDF Claimable Courses Malaysia',
  description: 'Browse all HRDF-registered training categories in Malaysia — IT, Leadership, Safety, Finance, HR and more.',
  alternates: { canonical: 'https://findtraining.com.my/categories' },
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'it-training': Monitor,
  'leadership-management': Users,
  'finance-accounting': DollarSign,
  'safety-health': ShieldCheck,
  'human-resources': Briefcase,
  'sales-marketing': TrendingUp,
  'customer-service': Smile,
  'soft-skills': BookOpen,
  'compliance-legal': Scale,
  'technical-skills': Wrench,
  'hospitality-tourism': UtensilsCrossed,
  'healthcare': Stethoscope,
  'manufacturing': Factory,
}

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Training Categories',
    description: 'Browse HRDF training providers by category',
    numberOfItems: categories.length,
    itemListElement: categories.map((cat: FtCategory, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cat.name,
      url: `https://findtraining.com/categories/${cat.slug}`,
    })),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <header className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Training Categories</h1>
        <p className="text-gray-600 text-base">
          Browse {categories.length} categories of HRDF-registered training providers in Malaysia.
          All courses are HRD Corp levy claimable.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat: FtCategory) => {
          const Icon = CATEGORY_ICONS[cat.slug] ?? HeartPulse
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F6FEC] hover:shadow-md transition-all group"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-[#0F6FEC]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC] leading-snug">
                  {cat.name}
                </span>
                {cat.description && (
                  <span className="block text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0F6FEC] flex-shrink-0 transition-colors" aria-hidden="true" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
