import Link from 'next/link'
import { SearchX, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <SearchX className="w-14 h-14 mx-auto mb-5 text-gray-300" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">
          That provider or page doesn&apos;t exist, or may have been removed.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0F6FEC' }}
        >
          Search all providers
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
