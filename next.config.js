const fs = require('fs')
const path = require('path')

const postsDirectory = path.join(process.cwd(), 'content/posts')

const isPostFile = (fileName) => {
  const isMarkdown = fileName.endsWith('.md') || fileName.endsWith('.mdx')
  const isNotReadme = !fileName.toLowerCase().startsWith('readme')

  return isMarkdown && isNotReadme
}

const isPostYearDirectory = (directoryName) => /^\d{4}$/.test(directoryName)

const getSlugFromFileName = (fileName) => fileName.replace(/\.(md|mdx)$/, '')

const getLegacyPostRedirects = () => {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  return fs.readdirSync(postsDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && isPostYearDirectory(entry.name))
    .flatMap(({ name: year }) =>
      fs.readdirSync(path.join(postsDirectory, year))
        .filter(isPostFile)
        .map((fileName) => {
          const slug = getSlugFromFileName(fileName)

          return {
            source: `/posts/${slug}`,
            destination: `/${year}/${slug}`,
            permanent: true,
          }
        })
    )
}

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
      { protocol: 'https', hostname: 'blog.xiowo.net' },
    ],
  },
  async redirects() {
    return getLegacyPostRedirects()
  },
}

module.exports = nextConfig
