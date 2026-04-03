/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@webvillage/engine'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
}

export default nextConfig
