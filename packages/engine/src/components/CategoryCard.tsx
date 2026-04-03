/**
 * CategoryCard Component
 * @product directory
 * @category navigation
 */
import Link from 'next/link'
import { 
  Code2, Palette, ShoppingCart, Users, Lightbulb, 
  Database, Globe, Shield, Zap, BookOpen, Briefcase,
  LayoutGrid, Settings, FileText, Package, Sparkles
} from 'lucide-react'

interface CategoryCardProps {
  category: {
    _id: string
    title: string
    description?: string
    slug: {
      current: string
    }
    icon?: string
    itemCount: number
  }
}

// Map category slugs/titles to icons and colors
function getCategoryStyle(title: string, slug: string) {
  const lower = (title + slug).toLowerCase()
  
  // Icon mapping
  let Icon = LayoutGrid // default
  if (lower.includes('cms') || lower.includes('content')) Icon = FileText
  if (lower.includes('ecommerce') || lower.includes('shop')) Icon = ShoppingCart
  if (lower.includes('design') || lower.includes('creative')) Icon = Palette
  if (lower.includes('develop') || lower.includes('code')) Icon = Code2
  if (lower.includes('analytics') || lower.includes('data')) Icon = Database
  if (lower.includes('marketing') || lower.includes('seo')) Icon = Sparkles
  if (lower.includes('social') || lower.includes('community')) Icon = Users
  if (lower.includes('security') || lower.includes('auth')) Icon = Shield
  if (lower.includes('framework') || lower.includes('library')) Icon = Zap
  if (lower.includes('education') || lower.includes('learning')) Icon = BookOpen
  if (lower.includes('business') || lower.includes('crm')) Icon = Briefcase
  if (lower.includes('api') || lower.includes('integration')) Icon = Globe
  if (lower.includes('tool') || lower.includes('utility')) Icon = Settings
  if (lower.includes('plugin') || lower.includes('extension')) Icon = Package
  
  // Color gradient mapping
  let gradient = 'from-blue-500 to-purple-600' // default
  if (lower.includes('cms') || lower.includes('content')) gradient = 'from-indigo-500 to-blue-600'
  if (lower.includes('ecommerce') || lower.includes('shop')) gradient = 'from-green-500 to-emerald-600'
  if (lower.includes('design') || lower.includes('creative')) gradient = 'from-pink-500 to-rose-600'
  if (lower.includes('develop') || lower.includes('code')) gradient = 'from-violet-500 to-purple-600'
  if (lower.includes('analytics') || lower.includes('data')) gradient = 'from-cyan-500 to-blue-600'
  if (lower.includes('marketing') || lower.includes('seo')) gradient = 'from-orange-500 to-red-600'
  if (lower.includes('social') || lower.includes('community')) gradient = 'from-blue-500 to-cyan-600'
  if (lower.includes('security') || lower.includes('auth')) gradient = 'from-red-500 to-orange-600'
  if (lower.includes('framework') || lower.includes('library')) gradient = 'from-yellow-500 to-orange-600'
  if (lower.includes('education') || lower.includes('learning')) gradient = 'from-emerald-500 to-green-600'
  if (lower.includes('business') || lower.includes('crm')) gradient = 'from-slate-500 to-gray-600'
  if (lower.includes('api') || lower.includes('integration')) gradient = 'from-teal-500 to-cyan-600'
  
  return { Icon, gradient }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { Icon, gradient } = getCategoryStyle(category.title, category.slug.current)
  
  return (
    <Link
      href={`/categories/${category.slug.current}`}
      className="group relative block bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Icon Container */}
          <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} p-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className="w-full h-full text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title with badge */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-all">
                {category.title}
              </h3>

              {/* Count badge */}
              <div className={`flex-shrink-0 px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-md`}>
                {category.itemCount}
              </div>
            </div>

            {/* Description */}
            {category.description && (
              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                {category.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">
                {category.itemCount === 1 ? '1 listing' : `${category.itemCount} listings`}
              </span>

              <span className="text-sm text-primary group-hover:text-primary/90 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Explore
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" 
             style={{ opacity: 0.1 }} />
      </div>
    </Link>
  )
}