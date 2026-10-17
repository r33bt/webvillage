import type { MetadataRoute } from 'next'

// All bots blocked until public launch. No tenant AEO routes are advertised here: a tenant's public files
// are reachable only when its slug is public and not internal_only.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/',
      },
    ],
    sitemap: 'https://app.brandhacker.com/sitemap.xml',
  }
}
