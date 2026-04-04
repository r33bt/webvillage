import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, LayoutDashboard, BookOpen, Inbox, CreditCard, LogOut } from 'lucide-react'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard | FindTraining',
  robots: { index: false },
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: GraduationCap },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/leads', label: 'Leads', icon: Inbox },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const email = user.email ?? ''

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <GraduationCap className="w-6 h-6" style={{ color: '#0F6FEC' }} aria-hidden="true" />
          <span className="text-base font-bold tracking-tight" style={{ color: '#0F6FEC' }}>
            FindTraining
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Dashboard navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors group"
            >
              <Icon
                className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors"
                aria-hidden="true"
              />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="mb-3 px-1">
            <p className="text-xs font-medium text-gray-500 truncate">Logged in as</p>
            <p className="text-xs text-gray-800 font-semibold truncate" title={email}>
              {email}
            </p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
