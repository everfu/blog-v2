'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { parseFeedXml } from '@/server/feeds/application/parse-feed'
import { getFriendFavicon } from '@/server/feeds/application/utils'
import { isHomeSectionKey } from '@/server/home/contracts/config'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { ContentStatus, FriendApplicationStatus, Json, StackKind } from '@/types/supabase'
import { logAdminEventWithClient } from '@/server/_shared/audit/log-admin-event-with-client'
import { revalidateContent } from '@/server/_shared/cache/revalidate'
import { uploadSiteMediaFile } from '@/server/_shared/storage/site-media'

const statusSchema = z.enum(['draft', 'published', 'archived'])
const stackKindSchema = z.enum(['hardware', 'software'])
const optionalUrlSchema = z.string().trim().url().optional().or(z.literal(''))
const optionalTextSchema = z.string().trim().optional().or(z.literal(''))

const watchedSchema = z.object({
  id: optionalTextSchema,
  title: z.string().trim().min(1).max(160),
  rating: z.coerce.number().min(0).max(10),
  year: z.string().trim().min(1).max(20),
  country: z.string().trim().max(80).optional(),
  genre: z.string().trim().max(160).optional(),
  director: z.string().trim().max(300).optional(),
  watchedAt: z.string().trim().min(1),
  imageUrl: optionalUrlSchema,
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const albumCategorySchema = z.object({
  id: optionalTextSchema,
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  label: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  coverImageUrl: optionalUrlSchema,
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const albumPhotoSchema = z.object({
  id: optionalTextSchema,
  categoryId: z.string().uuid(),
  label: optionalTextSchema,
  imageUrl: optionalUrlSchema,
  displayImageUrl: optionalUrlSchema,
  thumbnailImageUrl: optionalUrlSchema,
  takenAt: optionalTextSchema,
  description: optionalTextSchema,
  details: optionalTextSchema,
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const stackCategorySchema = z.object({
  id: optionalTextSchema,
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(100),
  kind: stackKindSchema,
  description: z.string().trim().max(500).optional(),
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const stackItemSchema = z.object({
  id: optionalTextSchema,
  categoryId: optionalTextSchema,
  kind: stackKindSchema,
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  itemCategory: z.string().trim().max(80).optional(),
  icon: optionalTextSchema,
  imageUrl: optionalUrlSchema,
  url: optionalUrlSchema,
  recommended: z.enum(['on']).optional(),
  wishlist: z.enum(['on']).optional(),
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const friendGroupSchema = z.object({
  id: optionalTextSchema,
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const friendLinkSchema = z.object({
  id: optionalTextSchema,
  groupId: optionalTextSchema,
  author: z.string().trim().min(1).max(100),
  sitenick: optionalTextSchema,
  description: z.string().trim().max(500).optional(),
  linkUrl: z.string().trim().url(),
  feedUrl: optionalUrlSchema,
  feedMuted: z.enum(['on']).optional(),
  avatarUrl: optionalUrlSchema,
  archs: optionalTextSchema,
  joinedAt: z.string().trim().min(1),
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const friendApplicationSettingsSchema = z.object({
  enabled: z.enum(['on']).optional(),
})

const friendApplicationStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['handled', 'rejected']),
})

const homeSectionSchema = z.object({
  id: optionalTextSchema,
  key: z.string().trim().min(1).max(80).regex(/^[a-z0-9_:-]+$/),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(300).optional(),
  enabled: z.enum(['on']).optional(),
  sortOrder: z.coerce.number().int().default(0),
  metadata: optionalTextSchema,
  headline: optionalTextSchema,
  intro: optionalTextSchema,
  buttonLabel: optionalTextSchema,
  buttonHref: optionalTextSchema,
  limit: z.coerce.number().int().min(1).max(12).optional(),
})

function textOrNull(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function parseCsv(value?: string) {
  return (value || '').split(',').map(item => item.trim()).filter(Boolean)
}

function parseJsonObject(value?: string): Json {
  if (!value?.trim()) return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    redirect('/admin/home?error=json')
  }
}

function buildHomeSectionMetadata(data: z.infer<typeof homeSectionSchema>): Json {
  if (data.key === 'hero') {
    return {
      headline: data.headline || '',
      intro: data.intro || '',
      buttonLabel: data.buttonLabel || '',
      buttonHref: data.buttonHref || '',
    }
  }

  if (data.key === 'recent_posts' || data.key === 'recently_watched') {
    return {
      limit: data.limit || 4,
    }
  }

  return parseJsonObject(data.metadata)
}

async function uploadImage(formData: FormData, fieldName: string, folder: string) {
  const file = formData.get(fieldName)
  if (!(file instanceof File) || file.size === 0) return null

  const uploaded = await uploadSiteMediaFile(file, folder)
  return uploaded?.publicUrl || null
}

async function resolveImageUrl(formData: FormData, urlField: string, fileField: string, folder: string) {
  return await uploadImage(formData, fileField, folder) || textOrNull(String(formData.get(urlField) || ''))
}

const audit = logAdminEventWithClient

export async function saveWatchedItem(admin: CurrentAdmin, formData: FormData) {
  const parsed = watchedSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/watched?error=invalid')

  const supabase = await createClient()
  const imageUrl = await resolveImageUrl(formData, 'imageUrl', 'imageFile', 'watched')
  const payload = {
    title: parsed.data.title,
    rating: parsed.data.rating,
    year: parsed.data.year,
    country: parsed.data.country || '',
    genre: parsed.data.genre || '',
    director: parsed.data.director || '',
    watched_at: parsed.data.watchedAt,
    image_url: imageUrl,
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }

  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('watched_items').update(payload).eq('id', id).select('id').single()
    : await supabase.from('watched_items').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/watched?error=save')
  await audit(supabase, admin, id ? 'update' : 'create', 'watched_item', result.data.id, { title: parsed.data.title })
  revalidateContent(['watched', 'home'], ['/', '/admin/watched'])
  redirect('/admin/watched?saved=1')
}

export async function deleteWatchedItem(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('watched_items').delete().eq('id', id)
  if (error) redirect('/admin/watched?error=delete')
  await audit(supabase, admin, 'delete', 'watched_item', id)
  revalidateContent(['watched', 'home'], ['/', '/admin/watched'])
  redirect('/admin/watched?deleted=1')
}

export async function saveAlbumCategory(admin: CurrentAdmin, formData: FormData) {
  const parsed = albumCategorySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/album?error=invalid-category')

  const supabase = await createClient()
  const coverImageUrl = await resolveImageUrl(formData, 'coverImageUrl', 'coverImageFile', 'album')
  const payload = {
    slug: parsed.data.slug,
    label: parsed.data.label,
    description: parsed.data.description || '',
    cover_image_url: coverImageUrl,
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('album_categories').update(payload).eq('id', id).select('id').single()
    : await supabase.from('album_categories').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/album?error=save-category')
  await audit(supabase, admin, id ? 'update' : 'create', 'album_category', result.data.id, { slug: parsed.data.slug })
  revalidateContent(['album'], ['/album', '/admin/album'])
  redirect('/admin/album?saved=category')
}

export async function saveAlbumPhoto(admin: CurrentAdmin, formData: FormData) {
  const parsed = albumPhotoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/album?error=invalid-photo')

  const supabase = await createClient()
  const imageUrl = await resolveImageUrl(formData, 'imageUrl', 'imageFile', 'album/photos')
  if (!imageUrl) redirect('/admin/album?error=photo-image')

  const payload = {
    category_id: parsed.data.categoryId,
    label: textOrNull(parsed.data.label),
    image_url: imageUrl,
    display_image_url: textOrNull(parsed.data.displayImageUrl),
    thumbnail_image_url: textOrNull(parsed.data.thumbnailImageUrl),
    taken_at: textOrNull(parsed.data.takenAt),
    description: textOrNull(parsed.data.description),
    details: parseJsonObject(parsed.data.details),
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('album_photos').update(payload).eq('id', id).select('id').single()
    : await supabase.from('album_photos').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/album?error=save-photo')
  await audit(supabase, admin, id ? 'update' : 'create', 'album_photo', result.data.id, { label: parsed.data.label })
  revalidateContent(['album'], ['/album', '/admin/album'])
  redirect('/admin/album?saved=photo')
}

export async function deleteAlbumPhoto(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('album_photos').delete().eq('id', id)
  if (error) redirect('/admin/album?error=delete-photo')
  await audit(supabase, admin, 'delete', 'album_photo', id)
  revalidateContent(['album'], ['/album', '/admin/album'])
  redirect('/admin/album?deleted=photo')
}

export async function saveStackCategory(admin: CurrentAdmin, formData: FormData) {
  const parsed = stackCategorySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/stack?error=invalid-category')

  const supabase = await createClient()
  const payload = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    kind: parsed.data.kind as StackKind,
    description: parsed.data.description || '',
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('stack_categories').update(payload).eq('id', id).select('id').single()
    : await supabase.from('stack_categories').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/stack?error=save-category')
  await audit(supabase, admin, id ? 'update' : 'create', 'stack_category', result.data.id, { name: parsed.data.name })
  revalidateContent(['stack'], ['/stack', '/admin/stack'])
  redirect('/admin/stack?saved=category')
}

export async function saveStackItem(admin: CurrentAdmin, formData: FormData) {
  const parsed = stackItemSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/stack?error=invalid-item')

  const supabase = await createClient()
  const imageUrl = await resolveImageUrl(formData, 'imageUrl', 'imageFile', 'stack')
  const payload = {
    category_id: textOrNull(parsed.data.categoryId),
    kind: parsed.data.kind as StackKind,
    name: parsed.data.name,
    description: parsed.data.description || '',
    item_category: parsed.data.itemCategory || '',
    icon: textOrNull(parsed.data.icon),
    image_url: imageUrl,
    url: textOrNull(parsed.data.url),
    recommended: parsed.data.recommended === 'on',
    wishlist: parsed.data.wishlist === 'on',
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('stack_items').update(payload).eq('id', id).select('id').single()
    : await supabase.from('stack_items').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/stack?error=save-item')
  await audit(supabase, admin, id ? 'update' : 'create', 'stack_item', result.data.id, { name: parsed.data.name })
  revalidateContent(['stack'], ['/stack', '/admin/stack'])
  redirect('/admin/stack?saved=item')
}

export async function deleteStackItem(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('stack_items').delete().eq('id', id)
  if (error) redirect('/admin/stack?error=delete-item')
  await audit(supabase, admin, 'delete', 'stack_item', id)
  revalidateContent(['stack'], ['/stack', '/admin/stack'])
  redirect('/admin/stack?deleted=item')
}

export async function saveFriendGroup(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendGroupSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-group')

  const supabase = await createClient()
  const payload = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description || '',
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('friend_groups').update(payload).eq('id', id).select('id').single()
    : await supabase.from('friend_groups').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/friends?error=save-group')
  await audit(supabase, admin, id ? 'update' : 'create', 'friend_group', result.data.id, { name: parsed.data.name })
  revalidateContent(['links', 'friends'], ['/links', '/friends', '/admin/friends'])
  redirect('/admin/friends?saved=group')
}

export async function saveFriendLink(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendLinkSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-link')

  const supabase = await createClient()
  const avatarUrl = await resolveImageUrl(formData, 'avatarUrl', 'avatarFile', 'friends')
  const payload = {
    group_id: textOrNull(parsed.data.groupId),
    author: parsed.data.author,
    sitenick: textOrNull(parsed.data.sitenick),
    description: parsed.data.description || '',
    link_url: parsed.data.linkUrl,
    feed_url: textOrNull(parsed.data.feedUrl),
    feed_muted: parsed.data.feedMuted === 'on',
    icon_url: getFriendFavicon(parsed.data.linkUrl),
    avatar_url: avatarUrl,
    archs: parseCsv(parsed.data.archs),
    joined_at: parsed.data.joinedAt,
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('friend_links').update(payload).eq('id', id).select('id').single()
    : await supabase.from('friend_links').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/friends?error=save-link')
  await audit(supabase, admin, id ? 'update' : 'create', 'friend_link', result.data.id, { author: parsed.data.author })
  revalidateContent(['links', 'friends'], ['/links', '/friends', '/admin/friends'])
  redirect('/admin/friends?saved=link')
}

export async function deleteFriendLink(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('friend_links').delete().eq('id', id)
  if (error) redirect('/admin/friends?error=delete-link')
  await audit(supabase, admin, 'delete', 'friend_link', id)
  revalidateContent(['links', 'friends'], ['/links', '/friends', '/admin/friends'])
  redirect('/admin/friends?deleted=link')
}

export async function saveFriendApplicationSettings(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendApplicationSettingsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-application-settings')

  const supabase = await createClient()
  const enabled = parsed.data.enabled === 'on'
  const { error } = await supabase
    .from('friend_application_settings')
    .upsert({
      key: 'application_form',
      value: { enabled },
      updated_by: admin.id,
    })

  if (error) redirect('/admin/friends?error=application-settings')
  await audit(supabase, admin, 'update_friend_application_settings', 'friend_application_settings', 'application_form', { enabled })
  revalidateContent(['friend-applications', 'links'], ['/links', '/admin/friends'])
  redirect('/admin/friends?saved=applications')
}

export async function updateFriendApplicationStatus(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendApplicationStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-application')

  const supabase = await createClient()
  const status = parsed.data.status as FriendApplicationStatus
  const { error } = await supabase
    .from('friend_link_applications')
    .update({ status })
    .eq('id', parsed.data.id)

  if (error) redirect('/admin/friends?error=application-status')
  await audit(supabase, admin, status === 'handled' ? 'handle_friend_application' : 'reject_friend_application', 'friend_link_application', parsed.data.id)
  revalidateContent(['friend-applications'], ['/admin/friends'])
  redirect('/admin/friends?saved=application-status')
}

export async function refreshFriendFeedSnapshots(admin: CurrentAdmin) {
  const supabase = await createClient()
  const service = createAdminClient()
  const [{ data: links, error }, { data: mutedLinks, error: mutedError }] = await Promise.all([
    service
      .from('friend_links')
      .select('id, author, sitenick, link_url, feed_url, avatar_url, archs')
      .eq('status', 'published')
      .eq('feed_muted', false)
      .not('feed_url', 'is', null),
    service
      .from('friend_links')
      .select('id')
      .eq('feed_muted', true),
  ])

  if (error || mutedError || !links) redirect('/admin/friends?error=feed-load')

  const mutedIds = (mutedLinks || []).map(link => link.id)
  if (mutedIds.length > 0) {
    const { error: clearError } = await service
      .from('friend_feed_snapshots')
      .delete()
      .in('friend_link_id', mutedIds)

    if (clearError) redirect('/admin/friends?error=feed-save')
  }

  const rows = []
  for (const link of links) {
    try {
      const response = await fetch(link.feed_url || '', {
        headers: {
          Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
          'User-Agent': `cube-blog-friends/1.0 (+${link.link_url})`,
        },
        cache: 'no-store',
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const parsed = parseFeedXml(await response.text(), 10)
      rows.push(...parsed.filter(item => item.pubDate).map(item => ({
        friend_link_id: link.id,
        author: link.author,
        sitenick: link.sitenick,
        avatar_url: link.avatar_url,
        site_link: link.link_url,
        archs: link.archs,
        title: item.title,
        link_url: item.link,
        summary: item.summary,
        cover_url: item.cover,
        pub_date: item.pubDate,
        source_status: { ok: true },
      })))
      await service.from('friend_links').update({ last_checked_at: new Date().toISOString(), last_error: null }).eq('id', link.id)
    } catch (feedError) {
      await service.from('friend_links').update({
        last_checked_at: new Date().toISOString(),
        last_error: feedError instanceof Error ? feedError.message : String(feedError),
      }).eq('id', link.id)
    }
  }

  if (rows.length > 0) {
    await service.from('friend_feed_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const { error: insertError } = await service.from('friend_feed_snapshots').insert(rows)
    if (insertError) redirect('/admin/friends?error=feed-save')
  }

  await audit(supabase, admin, 'refresh_feed_snapshots', 'friend_feed_snapshots', null, { inserted: rows.length })
  revalidateContent(['friends'], ['/friends', '/api/friends', '/admin/friends'])
  redirect('/admin/friends?refreshed=1')
}

export async function saveHomeSection(admin: CurrentAdmin, formData: FormData) {
  const parsed = homeSectionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/home?error=invalid')
  if (!isHomeSectionKey(parsed.data.key)) redirect('/admin/home?error=invalid')

  const supabase = await createClient()
  const payload = {
    key: parsed.data.key,
    title: parsed.data.title,
    subtitle: parsed.data.subtitle || '',
    enabled: parsed.data.enabled === 'on',
    sort_order: parsed.data.sortOrder,
    metadata: buildHomeSectionMetadata(parsed.data),
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('home_sections').update(payload).eq('id', id).select('id').single()
    : await supabase.from('home_sections').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/home?error=save')
  await audit(supabase, admin, id ? 'update' : 'create', 'home_section', result.data.id, { key: parsed.data.key })
  revalidateContent(['home'], ['/', '/admin/home'])
  redirect('/admin/home?saved=1')
}
