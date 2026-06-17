'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PostStatus } from '@/types/supabase'
import type { CurrentAdmin } from '@/lib/auth/admin'
import { logAdminEventWithClient } from '@/server/_shared/audit/log-admin-event-with-client'
import { revalidateContent, revalidatePaths } from '@/server/_shared/cache/revalidate'

const postSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  year: z.coerce.number().int().min(1970).max(3000),
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().min(1),
  tags: z.string().optional(),
  cover: z.string().trim().url().optional().or(z.literal('')),
  category: z.string().trim().min(1).max(40).default('DAILY'),
  status: z.enum(['draft', 'published', 'archived']),
  recent: z.enum(['on']).optional(),
})

function parseTags(value?: string) {
  return (value || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

export async function saveAdminPost(admin: CurrentAdmin, formData: FormData) {
  const parsed = postSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    redirect('/admin/posts?error=invalid-post')
  }

  const supabase = await createClient()
  const id = parsed.data.id || undefined
  const now = new Date().toISOString()
  const payload = {
    slug: parsed.data.slug,
    year: parsed.data.year,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt || '',
    content: parsed.data.content,
    tags: parseTags(parsed.data.tags),
    cover: parsed.data.cover || null,
    category: parsed.data.category,
    status: parsed.data.status as PostStatus,
    recent: parsed.data.recent === 'on',
    published_at: parsed.data.status === 'published' ? now : null,
  }

  if (id) {
    const { data: existing, error: existingError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (existingError) redirect(`/admin/posts/${id}?error=load`)
    if (!existing) redirect('/admin/posts?error=not-found')

    const { error: revisionError } = await supabase.from('post_revisions').insert({
      post_id: id,
      snapshot: existing,
      created_by: admin.id,
    })

    if (revisionError) redirect(`/admin/posts/${id}?error=revision`)

    const { error } = await supabase
      .from('posts')
      .update({
        ...payload,
        published_at: parsed.data.status === 'published'
          ? existing.published_at || now
          : null,
      })
      .eq('id', id)

    if (error) redirect(`/admin/posts/${id}?error=save`)

    await logAdminEventWithClient(supabase, admin, 'update', 'post', id, {
      slug: parsed.data.slug,
      status: parsed.data.status,
    })

    revalidateContent(['posts', 'home'], ['/', '/posts', `/${parsed.data.year}/${parsed.data.slug}`])
    redirect(`/admin/posts/${id}?saved=1`)
  }

  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
    .select('id')
    .single()

  if (error || !data) redirect('/admin/posts/new?error=save')

  await logAdminEventWithClient(supabase, admin, 'create', 'post', data.id, {
    slug: parsed.data.slug,
    status: parsed.data.status,
  })

  revalidateContent(['posts', 'home'], ['/', '/posts'])
  redirect(`/admin/posts/${data.id}?saved=1`)
}
