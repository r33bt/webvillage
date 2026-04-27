/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      // Map the dot-prefixed `.well-known/brand.json` URL to a non-dot folder
      // (Next.js filesystem routing excludes folders starting with `.`).
      {
        source: '/:slug/.well-known/brand.json',
        destination: '/:slug/well-known/brand.json',
      },
      // Map the `.txt`-suffixed AEO URL to a non-dot folder. Vercel + Next.js
      // route static-file extensions (`.txt`, `.xml`, etc.) through static
      // serving paths before hitting App Router dynamic routes — folder name
      // `llms.txt` doesn't reliably match `/pat/llms.txt` requests. Rewriting
      // forces the request through the `route.ts` handler.
      {
        source: '/:slug/llms.txt',
        destination: '/:slug/llms-txt',
      },
    ]
  },
}

module.exports = nextConfig
