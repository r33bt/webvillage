import { NextResponse } from 'next/server'

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /claim/

Sitemap: https://findtraining.com.my/sitemap.xml`

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
