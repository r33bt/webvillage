/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@webvillage/engine'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  // Year-less guide URLs; the old dated slugs answer with a 308.
  async redirects() {
    return [
      {
        source: '/resources/best-it-training-providers-malaysia-2026',
        destination: '/resources/best-it-training-providers-malaysia',
        permanent: true,
      },
      {
        source: '/resources/corporate-training-cost-malaysia-2026',
        destination: '/resources/corporate-training-cost-malaysia',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
