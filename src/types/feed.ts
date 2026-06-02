export type FeedArch = 'Cloudflare' | 'Hexo' | 'Astro' | 'Nuxt' | 'Vue' | 'Vercel' | '国内 CDN'

export interface FeedEntry {
  author: string
  sitenick?: string
  title?: string
  desc?: string
  link: string
  feed?: string
  icon: string
  avatar?: string
  archs?: FeedArch[]
  date: string
  comment?: string
  error?: string
}

export interface FriendItem {
  author: string
  sitenick?: string
  avatar?: string
  siteLink: string
  archs?: FeedArch[]
  title: string
  link: string
  summary: string
  cover?: string
  pubDate: string
}

export interface FriendSourceStatus {
  author: string
  sitenick?: string
  siteLink: string
  feed?: string
  ok: boolean
  count: number
  error?: string
}

export interface FriendsResponse {
  items: FriendItem[]
  sources: FriendSourceStatus[]
  generatedAt: string
}

export interface FeedGroup {
  name: string
  desc?: string
  entries: FeedEntry[]
}
