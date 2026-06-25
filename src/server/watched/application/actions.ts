'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { ContentStatus } from '@/types/supabase'
import { logAdminEventWithClient } from '@/server/_shared/audit/log-admin-event-with-client'
import { revalidateContent } from '@/server/_shared/cache/revalidate'
import { optionalTextSchema, optionalUrlSchema, resolveImageUrl, statusSchema, textOrNull } from '@/server/_shared/actions/form'

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
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'watched_item', result.data.id, { title: parsed.data.title })
  revalidateContent(['watched', 'home'], ['/', '/admin/watched'])
  redirect('/admin/watched?saved=1')
}

export async function deleteWatchedItem(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('watched_items').delete().eq('id', id)
  if (error) redirect('/admin/watched?error=delete')
  await logAdminEventWithClient(supabase, admin, 'delete', 'watched_item', id)
  revalidateContent(['watched', 'home'], ['/', '/admin/watched'])
  redirect('/admin/watched?deleted=1')
}
