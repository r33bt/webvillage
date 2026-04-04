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
}

module.exports = nextConfig
