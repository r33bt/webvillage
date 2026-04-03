/**
 * DirectoryGrid Component
 * @product directory
 * @category layout
 *
 * Responsive grid layout for displaying multiple listing cards.
 */
// components/DirectoryGrid.tsx
import { DirectoryCard } from './DirectoryCard'

interface DirectoryGridProps {
  businesses: any[]
  isSoftware?: boolean
  emptyMessage?: string
}

export function DirectoryGrid({ 
  businesses, 
  emptyMessage = 'No listings found. Try adjusting your filters.' 
}: DirectoryGridProps) {
  if (businesses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <DirectoryCard key={business._id} business={business} />
      ))}
    </div>
  )
}



