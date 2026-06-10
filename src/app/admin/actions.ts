'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CommentStatus, PostStatus } from '@/types/supabase'

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

async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/login')
  return admin
}

export async function savePost(formData: FormData) {
  const admin = await requireAdmin()
  const parsed = postSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    redirect('/admin/posts?error=invalid-post')
  }

  const supabase = createAdminClient()
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
    const { data: existing } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (existing) {
      await supabase.from('post_revisions').insert({
        post_id: id,
        snapshot: existing,
        created_by: admin.id,
      })
    }

    const { error } = await supabase
      .from('posts')
      .update({
        ...payload,
        published_at: parsed.data.status === 'published'
          ? existing?.published_at || now
          : null,
      })
      .eq('id', id)
    if (error) redirect(`/admin/posts/${id}?error=save`)

    await supabase.from('admin_audit_logs').insert({
      actor_id: admin.id,
      action: 'update',
      entity_type: 'post',
      entity_id: id,
      metadata: { slug: parsed.data.slug, status: parsed.data.status },
    })

    revalidatePath('/')
    revalidatePath('/posts')
    revalidatePath(`/${parsed.data.year}/${parsed.data.slug}`)
    redirect(`/admin/posts/${id}?saved=1`)
  }

  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
    .select('id')
    .single()

  if (error || !data) redirect('/admin/posts/new?error=save')

  await supabase.from('admin_audit_logs').insert({
    actor_id: admin.id,
    action: 'create',
    entity_type: 'post',
    entity_id: data.id,
    metadata: { slug: parsed.data.slug, status: parsed.data.status },
  })

  revalidatePath('/')
  revalidatePath('/posts')
  redirect(`/admin/posts/${data.id}?saved=1`)
}

export async function updateCommentStatus(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '') as CommentStatus

  if (!id || !['pending', 'approved', 'spam', 'deleted'].includes(status)) {
    redirect('/admin/comments?error=invalid-comment')
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('comments')
    .update({ status })
    .eq('id', id)

  if (!error) {
    await supabase.from('admin_audit_logs').insert({
      actor_id: admin.id,
      action: status,
      entity_type: 'comment',
      entity_id: id,
      metadata: {},
    })
  }

  revalidatePath('/admin/comments')
  redirect('/admin/comments')
}
