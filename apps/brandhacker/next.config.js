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
    ]
  },
}

module.exports = nextConfig
