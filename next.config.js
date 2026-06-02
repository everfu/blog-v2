/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.lightxi.com' },
      { protocol: 'https', hostname: 'wmimg.com' },
      { protocol: 'https', hostname: 'unavatar.webp.se' },
      { protocol: 'https', hostname: '7.isyangs.cn' },
      { protocol: 'https', hostname: 'www.zhilu.site' },
    ],
  },
}

module.exports = nextConfig
