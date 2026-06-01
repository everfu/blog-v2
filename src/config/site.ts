export const siteConfig = {
  name: "Fuever's Blog",
  title: "Fuever's Blog",
  description: 'A nook where thoughts & ideas sometimes echo',
  url: 'https://blog.efu.me',
  locale: 'zh-CN',

  author: {
    name: 'Fuever',
    email: 'o@efu.me',
    url: 'https://efu.me',
  },

  social: {
    github: 'https://github.com/everfu',
    twitter: 'https://twitter.com/everfu8',
  },

  assets: {
    favicon: '/favicon-32x32.ico',
    appleTouchIcon: '/apple-touch-icon.png',
    ogImage: '/og-image.png',
    avatar: '/mstile-150x150.png',
  },

  copyright: {
    startYear: 2022,
  },

  stats: {
    repositories: 18,
    stars: 1106,
  },

  comment: {
    envId: 'https://api.efu.me/tk/',
    scriptSrc: 'https://cdn.bootcdn.net/ajax/libs/twikoo/1.6.44/twikoo.min.js',
    options: {},
  },

  liveblocks: {
    publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
  },
} as const

export type SiteConfig = typeof siteConfig
