import type { MetadataRoute } from 'next'

// AI crawlers are allowed to fetch the AEO surface routes only.
// All other bots remain blocked until public launch.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'GPTBot',
        allow: ['/pat/llms.txt', '/pat/.well-known/brand.json'],
        disallow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/pat/llms.txt', '/pat/.well-known/brand.json'],
        disallow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/pat/llms.txt', '/pat/.well-known/brand.json'],
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/pat/llms.txt', '/pat/.well-known/brand.json'],
        disallow: '/',
      },
      {
        userAgent: '*',
        disallow: '/',
      },
    ],
    sitemap: 'https://app.brandhacker.com/sitemap.xml',
  }
}
