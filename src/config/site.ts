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
    repositories: 11,
    stars: 1189,
  },

  friends: {
    initialVisibleCount: 8,
    visibleIncrement: 8,
  },

  comment: {
    envId: 'https://cm.efu.me',
    scriptSrc: 'https://open.lightxi.com/unpkg/twikoo@1.7.11/dist/twikoo.min.js',
    options: {},
  },

  liveblocks: {
    publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
  },
} as const

export type SiteConfig = typeof siteConfig
