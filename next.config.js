/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
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
      { protocol: 'https', hostname: 'blog.xiowo.net' },
      { protocol: 'https', hostname: 'weavatar.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'skillicons.dev' },
    ],
  },
}

module.exports = nextConfig
