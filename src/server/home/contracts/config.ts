import { siteConfig } from '@/config/site'
import type { Json } from '@/types/supabase'
import type { HomeSection } from '@/server/content/contracts/types'

export const HOME_SECTION_KEYS = ['hero', 'recent_posts', 'recently_watched'] as const

export type HomeSectionKey = typeof HOME_SECTION_KEYS[number]

export interface HeroSectionMetadata {
  headline: string
  intro: string
  buttonLabel: string
  buttonHref: string
}

export interface ListSectionMetadata {
  limit: number
}

export type HomeSectionMetadata = HeroSectionMetadata | ListSectionMetadata

export type ConfiguredHomeSection = HomeSection & {
  key: HomeSectionKey
}

type DefaultHomeSection = Omit<ConfiguredHomeSection, 'id'>

export const DEFAULT_HERO_METADATA: HeroSectionMetadata = {
  headline: 'A nook where `thoughts`\n& `ideas` sometimes\necho',
  intro: `Self-taught developer passionate about open source. Creator of \`${siteConfig.stats.repositories} repositories\` with \`${siteConfig.stats.stars.toLocaleString()} stars\` on GitHub.\n\nMinimalist obsessed with speed and lightweight solutions. Photography enthusiast, traveler, and documentary lover.`,
  buttonLabel: 'ABOUT ME',
  buttonHref: siteConfig.author.url,
}

export const DEFAULT_HOME_SECTIONS: DefaultHomeSection[] = [
  {
    key: 'hero',
    title: 'Home',
    subtitle: '首页主视觉',
    enabled: true,
    sortOrder: 10,
    metadata: DEFAULT_HERO_METADATA as unknown as Json,
  },
  {
    key: 'recent_posts',
    title: 'Recent Posts',
    subtitle: '最近文章',
    enabled: true,
    sortOrder: 20,
    metadata: { limit: 4 },
  },
  {
    key: 'recently_watched',
    title: 'Recently Watched',
    subtitle: '首页电影推荐',
    enabled: true,
    sortOrder: 30,
    metadata: { limit: 4 },
  },
]

export function isHomeSectionKey(key: string): key is HomeSectionKey {
  return HOME_SECTION_KEYS.includes(key as HomeSectionKey)
}

function getObject(value: Json): Record<string, Json | undefined> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function getString(value: Json | undefined, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function getLimit(value: Json | undefined, fallback = 4) {
  const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(12, Math.max(1, Math.trunc(numeric)))
}

export function getDefaultHomeSection(key: HomeSectionKey) {
  return DEFAULT_HOME_SECTIONS.find(section => section.key === key)!
}

export function parseHeroMetadata(metadata: Json): HeroSectionMetadata {
  const object = getObject(metadata)
  return {
    headline: getString(object.headline, DEFAULT_HERO_METADATA.headline),
    intro: getString(object.intro, DEFAULT_HERO_METADATA.intro),
    buttonLabel: getString(object.buttonLabel, DEFAULT_HERO_METADATA.buttonLabel),
    buttonHref: getString(object.buttonHref, DEFAULT_HERO_METADATA.buttonHref),
  }
}

export function parseListMetadata(metadata: Json): ListSectionMetadata {
  return {
    limit: getLimit(getObject(metadata).limit),
  }
}

export function mergeDefaultHomeSections(sections: HomeSection[], includeDisabled = true): ConfiguredHomeSection[] {
  const byKey = new Map(sections.filter(section => isHomeSectionKey(section.key)).map(section => [section.key, section]))

  return DEFAULT_HOME_SECTIONS
    .map(defaultSection => {
      const section = byKey.get(defaultSection.key)
      const title = section?.key === 'hero' && section.title === 'Hero' ? defaultSection.title : section?.title

      return {
        ...defaultSection,
        id: section?.id || '',
        title: title || defaultSection.title,
        subtitle: section?.subtitle ?? defaultSection.subtitle,
        enabled: section?.enabled ?? defaultSection.enabled,
        sortOrder: section?.sortOrder ?? defaultSection.sortOrder,
        metadata: section?.metadata ?? defaultSection.metadata,
      }
    })
    .filter(section => includeDisabled || section.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
