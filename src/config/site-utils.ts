import { siteConfig } from '@/config/site'

export const absoluteUrl = (pathname = '/') =>
  new URL(pathname, siteConfig.url).toString()

export const currentYear = () => new Date().getFullYear()

export const toIsoDate = (date: string, fallback = `${siteConfig.copyright.startYear}-01-01`) => {
  const parsed = new Date(date || fallback)

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }

  const fallbackDate = new Date(fallback)
  return Number.isNaN(fallbackDate.getTime())
    ? new Date(0).toISOString()
    : fallbackDate.toISOString()
}

export const defaultOgImage = () => absoluteUrl(siteConfig.assets.ogImage)
