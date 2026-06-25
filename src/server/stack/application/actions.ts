'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { ContentStatus, StackKind } from '@/types/supabase'
import { logAdminEventWithClient } from '@/server/_shared/audit/log-admin-event-with-client'
import { revalidateContent } from '@/server/_shared/cache/revalidate'
import { optionalTextSchema, optionalUrlSchema, resolveImageUrl, statusSchema, textOrNull } from '@/server/_shared/actions/form'

const stackKindSchema = z.enum(['hardware', 'software'])

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
  icon: z.string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^[a-z0-9-]*$/)
    .refine(value => !value.startsWith('i-'))
    .optional(),
  imageUrl: optionalUrlSchema,
  url: optionalUrlSchema,
  recommended: z.enum(['on']).optional(),
  wishlist: z.enum(['on']).optional(),
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

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
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'stack_category', result.data.id, { name: parsed.data.name })
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
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'stack_item', result.data.id, { name: parsed.data.name })
  revalidateContent(['stack'], ['/stack', '/admin/stack'])
  redirect('/admin/stack?saved=item')
}

export async function deleteStackItem(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('stack_items').delete().eq('id', id)
  if (error) redirect('/admin/stack?error=delete-item')
  await logAdminEventWithClient(supabase, admin, 'delete', 'stack_item', id)
  revalidateContent(['stack'], ['/stack', '/admin/stack'])
  redirect('/admin/stack?deleted=item')
}
