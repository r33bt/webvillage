import { NextResponse } from 'next/server'

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /dashboard/
Disallow: /login
Disallow: /claim/

Sitemap: https://findtraining.com/sitemap.xml`

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
