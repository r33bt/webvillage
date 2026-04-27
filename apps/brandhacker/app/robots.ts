import type { MetadataRoute } from 'next'

// Block all crawlers until BrandHacker is ready for public launch.
// When launching, replace with allow rules + sitemap reference.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/',
      },
    ],
  }
}
