'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { Json } from '@/types/supabase'
import { logAdminEventWithClient } from '@/server/_shared/audit/log-admin-event-with-client'
import { revalidateContent } from '@/server/_shared/cache/revalidate'
import { optionalTextSchema, parseJsonObject, textOrNull } from '@/server/_shared/actions/form'
import { isHomeSectionKey } from '@/server/home/contracts/config'

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
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'home_section', result.data.id, { key: parsed.data.key })
  revalidateContent(['home'], ['/', '/admin/home'])
  redirect('/admin/home?saved=1')
}
