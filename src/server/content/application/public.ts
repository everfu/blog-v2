import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { DEFAULT_FRIEND_AVATAR, getFriendFavicon } from '@/server/feeds/application/utils'
import type { AlbumCategory, FeedEntry, FeedGroup, FriendApplicationSettings, FriendsResponse, HardwareItem, HomeSection, SoftwareCategory, WatchedItem } from '../contracts/types'

const defaultFriendApplicationSettings: FriendApplicationSettings = {
  enabled: false,
}

function ensureAdminClient() {
  if (!isSupabaseAdminConfigured) return null
  return createAdminClient()
}

async function fetchHomeSections(): Promise<HomeSection[]> {
  const supabase = ensureAdminClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('home_sections')
    .select('id, key, title, subtitle, enabled, sort_order, metadata')
    .order('sort_order', { ascending: true })

  if (error || !data) return []

  return data.map(section => ({
    id: section.id,
    key: section.key,
    title: section.title,
    subtitle: section.subtitle,
    enabled: section.enabled,
    sortOrder: section.sort_order,
    metadata: section.metadata,
  }))
}

async function fetchWatchedItems(limit?: number): Promise<WatchedItem[]> {
  const supabase = ensureAdminClient()
  if (!supabase) return []

  let query = supabase
    .from('watched_items')
    .select('title, rating, year, country, genre, director, watched_at, image_url')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('watched_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error || !data) return []

  return data.map(item => ({
    title: item.title,
    rating: Number(item.rating),
    year: item.year,
    country: item.country,
    genre: item.genre,
    director: item.director,
    date: item.watched_at,
    image: item.image_url || undefined,
  }))
}

async function fetchAlbumCategories(): Promise<AlbumCategory[]> {
  const supabase = ensureAdminClient()
  if (!supabase) return []

  const [{ data: categories, error: categoriesError }, { data: photos }] = await Promise.all([
    supabase
    .from('album_categories')
      .select('id, slug, label, description, cover_image_url')
    .eq('status', 'published')
      .order('sort_order', { ascending: true }),
    supabase
      .from('album_photos')
      .select('category_id, label, image_url, display_image_url, thumbnail_image_url, taken_at, description, details, status, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
  ])

  if (categoriesError || !categories) return []

  return categories.map(category => ({
    name: category.slug,
    label: category.label,
    image: category.cover_image_url || '',
    list: (photos || [])
      .filter(photo => photo.category_id === category.id)
      .map(photo => ({
        label: photo.label || undefined,
        image: photo.image_url,
        displayImage: photo.display_image_url || undefined,
        thumbnailImage: photo.thumbnail_image_url || undefined,
        date: photo.taken_at || undefined,
        description: photo.description || undefined,
        details: typeof photo.details === 'object' && photo.details && !Array.isArray(photo.details)
          ? photo.details as Record<string, string | number>
          : undefined,
      })),
  }))
}

async function fetchStack() {
  const supabase = ensureAdminClient()
  if (!supabase) return { hardwareItems: [], softwareCategories: [] }

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from('stack_categories')
      .select('id, slug, name, kind, status, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
    supabase
      .from('stack_items')
      .select('id, category_id, kind, name, description, item_category, icon, image_url, url, recommended, wishlist, status, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
  ])

  const hardwareItems: HardwareItem[] = (items || [])
    .filter(item => item.kind === 'hardware')
    .map(item => ({
      name: item.name,
      image: item.image_url || '',
      category: item.item_category,
      url: item.url || undefined,
      wishlist: item.wishlist,
    }))

  const softwareCategories: SoftwareCategory[] = (categories || [])
    .filter(category => category.kind === 'software')
    .map(category => ({
      name: category.name,
      items: (items || [])
        .filter(item => item.kind === 'software' && item.category_id === category.id)
        .map<SoftwareCategory['items'][number]>(item => ({
          name: item.name,
          icon: item.icon || undefined,
          image: item.image_url || undefined,
          description: item.description,
          url: item.url || undefined,
          recommended: item.recommended,
        })),
    }))
    .filter(category => category.items.length > 0)

  return { hardwareItems, softwareCategories }
}

async function fetchFeedGroups(): Promise<FeedGroup[]> {
  const supabase = ensureAdminClient()
  if (!supabase) return []

  const [{ data: groups, error: groupsError }, { data: links }] = await Promise.all([
    supabase
    .from('friend_groups')
      .select('id, slug, name, description')
    .eq('status', 'published')
      .order('sort_order', { ascending: true }),
    supabase
      .from('friend_links')
      .select('group_id, author, sitenick, description, link_url, feed_url, feed_muted, icon_url, avatar_url, archs, joined_at, status, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
  ])

  if (groupsError || !groups) return []

  return groups.map(group => ({
    name: group.name,
    desc: group.description || undefined,
    entries: (links || [])
      .filter(link => link.group_id === group.id)
      .map<FeedEntry>(link => ({
        author: link.author,
        sitenick: link.sitenick || undefined,
        desc: link.description || undefined,
        link: link.link_url,
        feed: link.feed_url || undefined,
        feedMuted: link.feed_muted,
        icon: link.icon_url || getFriendFavicon(link.link_url),
        avatar: link.avatar_url || undefined,
        archs: link.archs as FeedEntry['archs'],
        date: link.joined_at,
      })),
  }))
}

async function fetchFriendsSnapshot(): Promise<FriendsResponse> {
  const supabase = ensureAdminClient()
  if (!supabase) {
    return { items: [], sources: [], generatedAt: new Date().toISOString() }
  }

  const [{ data: items }, { data: links }] = await Promise.all([
    supabase
      .from('friend_feed_snapshots')
      .select('author, sitenick, avatar_url, site_link, archs, title, link_url, summary, cover_url, pub_date, friend_links!inner(feed_muted)')
      .eq('friend_links.feed_muted', false)
      .order('pub_date', { ascending: false })
      .limit(100),
    supabase
      .from('friend_links')
      .select('author, sitenick, link_url, feed_url, last_error')
      .eq('status', 'published')
      .eq('feed_muted', false)
      .not('feed_url', 'is', null)
      .order('sort_order', { ascending: true }),
  ])

  return {
    items: (items || []).map(item => ({
      author: item.author,
      sitenick: item.sitenick || undefined,
      avatar: item.avatar_url || DEFAULT_FRIEND_AVATAR,
      siteLink: item.site_link,
      archs: item.archs as FeedEntry['archs'],
      title: item.title,
      link: item.link_url,
      summary: item.summary,
      cover: item.cover_url || undefined,
      pubDate: item.pub_date,
    })),
    sources: (links || []).map(link => ({
      author: link.author,
      sitenick: link.sitenick || undefined,
      siteLink: link.link_url,
      feed: link.feed_url || undefined,
      ok: !link.last_error,
      count: 0,
      error: link.last_error || undefined,
    })),
    generatedAt: new Date().toISOString(),
  }
}

function parseFriendApplicationSettings(value: unknown): FriendApplicationSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaultFriendApplicationSettings
  }

  return {
    enabled: (value as { enabled?: unknown }).enabled === true,
  }
}

async function fetchFriendApplicationSettings(): Promise<FriendApplicationSettings> {
  const supabase = ensureAdminClient()
  if (!supabase) return defaultFriendApplicationSettings

  const { data, error } = await supabase
    .from('friend_application_settings')
    .select('value')
    .eq('key', 'application_form')
    .maybeSingle()

  if (error || !data) return defaultFriendApplicationSettings
  return parseFriendApplicationSettings(data.value)
}

export const getHomeSections = unstable_cache(fetchHomeSections, ['home-sections'], {
  tags: ['home'],
  revalidate: 300,
})

export const getWatchedItems = unstable_cache(fetchWatchedItems, ['watched-items'], {
  tags: ['watched', 'home'],
  revalidate: 300,
})

export const getAlbumCategories = unstable_cache(fetchAlbumCategories, ['album-categories'], {
  tags: ['album'],
  revalidate: 300,
})

export const getStack = unstable_cache(fetchStack, ['stack'], {
  tags: ['stack'],
  revalidate: 300,
})

export const getFeedGroups = unstable_cache(fetchFeedGroups, ['feed-groups'], {
  tags: ['links', 'friends'],
  revalidate: 300,
})

export const getFriendsSnapshot = unstable_cache(fetchFriendsSnapshot, ['friend-feed-snapshots'], {
  tags: ['friends'],
  revalidate: 300,
})

export const getFriendApplicationSettings = unstable_cache(fetchFriendApplicationSettings, ['friend-application-settings'], {
  tags: ['friend-applications', 'links'],
  revalidate: 300,
})
