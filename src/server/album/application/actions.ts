'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { ContentStatus } from '@/types/supabase'
import { logAdminEventWithClient } from '@/server/_shared/audit/log-admin-event-with-client'
import { revalidateContent } from '@/server/_shared/cache/revalidate'
import { optionalTextSchema, optionalUrlSchema, parseJsonObject, resolveImageUrl, statusSchema, textOrNull } from '@/server/_shared/actions/form'

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
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'album_category', result.data.id, { slug: parsed.data.slug })
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
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'album_photo', result.data.id, { label: parsed.data.label })
  revalidateContent(['album'], ['/album', '/admin/album'])
  redirect('/admin/album?saved=photo')
}

export async function deleteAlbumPhoto(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('album_photos').delete().eq('id', id)
  if (error) redirect('/admin/album?error=delete-photo')
  await logAdminEventWithClient(supabase, admin, 'delete', 'album_photo', id)
  revalidateContent(['album'], ['/album', '/admin/album'])
  redirect('/admin/album?deleted=photo')
}
