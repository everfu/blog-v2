import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type {
  AdminAlbumCategory,
  AdminAlbumPhoto,
  AdminFriendGroup,
  AdminFriendApplication,
  AdminFriendLink,
  AdminHomeSection,
  AdminStackCategory,
  AdminStackItem,
  AdminWatchedItem,
} from '../contracts/types'

export async function getAdminWatchedItems(): Promise<AdminWatchedItem[]> {
  if (!isSupabaseConfigured) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('watched_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('watched_at', { ascending: false })

  if (error || !data) return []
  return data.map(item => ({
    id: item.id,
    title: item.title,
    rating: Number(item.rating),
    year: item.year,
    country: item.country,
    genre: item.genre,
    director: item.director,
    date: item.watched_at,
    image: item.image_url || undefined,
    imageUrl: item.image_url || undefined,
    status: item.status,
    sortOrder: item.sort_order,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }))
}

export async function getAdminAlbum(): Promise<{ categories: AdminAlbumCategory[]; photos: AdminAlbumPhoto[] }> {
  if (!isSupabaseConfigured) return { categories: [], photos: [] }
  const supabase = await createClient()
  const [{ data: categories }, { data: photos }] = await Promise.all([
    supabase.from('album_categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('album_photos').select('*').order('sort_order', { ascending: true }),
  ])
  const categoryLabelById = new Map((categories || []).map(category => [category.id, category.label]))

  const mappedPhotos: AdminAlbumPhoto[] = (photos || []).map(photo => ({
    id: photo.id,
    categoryId: photo.category_id,
    categoryLabel: categoryLabelById.get(photo.category_id),
    label: photo.label || undefined,
    imageUrl: photo.image_url,
    displayImageUrl: photo.display_image_url || undefined,
    thumbnailImageUrl: photo.thumbnail_image_url || undefined,
    takenAt: photo.taken_at || undefined,
    description: photo.description || undefined,
    details: photo.details,
    status: photo.status,
    sortOrder: photo.sort_order,
    createdAt: photo.created_at,
    updatedAt: photo.updated_at,
  }))

  return {
    categories: (categories || []).map(category => ({
      id: category.id,
      slug: category.slug,
      label: category.label,
      description: category.description,
      coverImageUrl: category.cover_image_url || undefined,
      status: category.status,
      sortOrder: category.sort_order,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
      photos: mappedPhotos.filter(photo => photo.categoryId === category.id),
    })),
    photos: mappedPhotos,
  }
}

export async function getAdminStack(): Promise<{ categories: AdminStackCategory[]; items: AdminStackItem[] }> {
  if (!isSupabaseConfigured) return { categories: [], items: [] }
  const supabase = await createClient()
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from('stack_categories').select('*').order('kind', { ascending: true }).order('sort_order', { ascending: true }),
    supabase.from('stack_items').select('*').order('kind', { ascending: true }).order('sort_order', { ascending: true }),
  ])
  const categoryNameById = new Map((categories || []).map(category => [category.id, category.name]))

  return {
    categories: (categories || []).map(category => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      kind: category.kind,
      description: category.description,
      status: category.status,
      sortOrder: category.sort_order,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    })),
    items: (items || []).map(item => ({
      id: item.id,
      categoryId: item.category_id || undefined,
      categoryName: item.category_id ? categoryNameById.get(item.category_id) : undefined,
      kind: item.kind,
      name: item.name,
      description: item.description,
      itemCategory: item.item_category,
      icon: item.icon || undefined,
      imageUrl: item.image_url || undefined,
      url: item.url || undefined,
      recommended: item.recommended,
      wishlist: item.wishlist,
      status: item.status,
      sortOrder: item.sort_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  }
}

export async function getAdminFriends(): Promise<{ groups: AdminFriendGroup[]; links: AdminFriendLink[] }> {
  if (!isSupabaseConfigured) return { groups: [], links: [] }
  const supabase = await createClient()
  const [{ data: groups }, { data: links }] = await Promise.all([
    supabase.from('friend_groups').select('*').order('sort_order', { ascending: true }),
    supabase.from('friend_links').select('*').order('sort_order', { ascending: true }),
  ])
  const groupNameById = new Map((groups || []).map(group => [group.id, group.name]))

  const mappedLinks: AdminFriendLink[] = (links || []).map(link => ({
    id: link.id,
    groupId: link.group_id || undefined,
    groupName: link.group_id ? groupNameById.get(link.group_id) : undefined,
    author: link.author,
    sitenick: link.sitenick || undefined,
    description: link.description,
    linkUrl: link.link_url,
    feedUrl: link.feed_url || undefined,
    feedMuted: link.feed_muted,
    iconUrl: link.icon_url || undefined,
    avatarUrl: link.avatar_url || undefined,
    archs: link.archs,
    joinedAt: link.joined_at,
    status: link.status,
    sortOrder: link.sort_order,
    lastCheckedAt: link.last_checked_at || undefined,
    lastError: link.last_error || undefined,
    createdAt: link.created_at,
    updatedAt: link.updated_at,
  }))

  return {
    groups: (groups || []).map(group => ({
      id: group.id,
      slug: group.slug,
      name: group.name,
      description: group.description,
      status: group.status,
      sortOrder: group.sort_order,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
      links: mappedLinks.filter(link => link.groupId === group.id),
    })),
    links: mappedLinks,
  }
}

export async function getAdminFriendApplications(): Promise<AdminFriendApplication[]> {
  if (!isSupabaseConfigured) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('friend_link_applications')
    .select('*')
    .order('status', { ascending: false })
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(application => ({
    id: application.id,
    authorName: application.author_name,
    siteName: application.site_name,
    description: application.description,
    siteUrl: application.site_url,
    avatarUrl: application.avatar_url || undefined,
    feedUrl: application.feed_url || undefined,
    contact: application.contact,
    note: application.note,
    status: application.status,
    userAgent: application.user_agent || undefined,
    createdAt: application.created_at,
    updatedAt: application.updated_at,
  }))
}

export async function getAdminHomeSections(): Promise<AdminHomeSection[]> {
  if (!isSupabaseConfigured) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
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
    createdAt: section.created_at,
    updatedAt: section.updated_at,
  }))
}
