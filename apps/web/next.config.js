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
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
