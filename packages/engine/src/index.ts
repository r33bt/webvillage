// @webvillage/engine — main barrel export

// Components
export * from './components'

// Site config
export * from './config'

// WV directory network types (primary)
export * from './types/wv'

// FindTraining types (kept for backwards compat)
export * from './types/ft'

// Sanity query functions (for Sanity-backed sites)
export * from './queries'

// Sanity schemas (for Sanity Studio configs)
export * from './schemas'

// Supabase adapters — wv_ (generic) + ft_ (FindTraining)
// Import via: import { searchListings, getDirectory } from '@webvillage/engine/adapters/supabase'
// Or via:    import { ... } from '@webvillage/engine' (re-exported below for convenience)
export {
  createWvClient,
  createWvServiceClient,
  getDirectory,
  getDirectoryById,
  getAllDirectories,
  getCategories,
  getCategoryBySlug,
  getListingBySlug,
  getListingById,
  searchListings,
  getFeaturedListings,
  recordContactClick,
  getDirectoryStats,
  getRecentSyncLogs,
} from './adapters/supabase'
