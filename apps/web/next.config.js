/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@webvillage/ui',
    '@webvillage/config',
    '@webvillage/db',
    '@webvillage/auth',
    '@webvillage/email',
    '@webvillage/validation',
  ],
  eslint: {
    // Lint passes locally; Vercel build env produces false-positive on productPreviewProviders
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/pricing', destination: '/directories/pricing', permanent: true },
      { source: '/features', destination: '/directories#features', permanent: true },
    ]
  },
}

module.exports = nextConfig
