// src/app/admin/layout.tsx
// Admin area layout — not publicly linked.
// Protected at the page level via ADMIN_TOKEN env var check.

import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin | FindTraining',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <GraduationCap className="w-5 h-5 flex-shrink-0" style={{ color: '#0F6FEC' }} />
          <span className="text-base font-bold" style={{ color: '#0F6FEC' }}>
            FindTraining
          </span>
          <span className="text-gray-300 mx-1 select-none">|</span>
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Admin
          </span>
          <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
            Admin area — not publicly linked
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
