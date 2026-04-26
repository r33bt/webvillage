import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Coming-soon gate.
// Only active when COMING_SOON=true in the environment.
// Set on production target in Vercel; leave UNSET on preview/development so the
// staging URLs continue to serve the full V2 site.

const ALLOWED_PATHS = new Set([
  '/coming-soon',
  '/icon',
  '/opengraph-image',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

export function middleware(request: NextRequest) {
  if (process.env.COMING_SOON !== 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  if (ALLOWED_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // Allow Next internals + API routes (Resend webhooks, etc) through the gate.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/opengraph-image')
  ) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/coming-soon'
  url.search = ''
  return NextResponse.redirect(url, 307)
}

export const config = {
  // Skip middleware on static asset paths so the edge can serve them quickly.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
