import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { PostStatus } from '@/types/supabase'
import { mapPost, postSelect } from '../data/mapper'
import type { AdminPost, AdminPostFilters, PostRevisionSummary } from '../contracts/types'

function applyPostFilters(posts: AdminPost[], filters: AdminPostFilters = {}) {
  const keyword = filters.keyword?.trim().toLowerCase()
  const year = filters.year?.trim()
  const category = filters.category?.trim().toLowerCase()

  return posts.filter(post => {
    if (filters.status && filters.status !== 'all' && post.status !== filters.status) return false
    if (filters.recent && !post.recent) return false
    if (year && post.year !== year) return false
    if (category && post.category.toLowerCase() !== category) return false
    if (keyword) {
      const haystack = [
        post.title,
        post.slug,
        post.excerpt,
        post.category,
        post.tags.join(' '),
      ].join(' ').toLowerCase()

      if (!haystack.includes(keyword)) return false
    }

    return true
  })
}

export async function getAdminPosts(filters: AdminPostFilters = {}): Promise<AdminPost[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .order('updated_at', { ascending: false })

  if (error || !data) return []

  return applyPostFilters(data.map(mapPost), filters)
}

export async function getAdminPostById(id: string): Promise<AdminPost | null> {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null

  return mapPost(data)
}

export async function getPostCountByStatus() {
  const posts = await getAdminPosts()

  return posts.reduce<Record<PostStatus, number>>(
    (counts, post) => {
      counts[post.status] += 1
      return counts
    },
    { draft: 0, published: 0, archived: 0 }
  )
}

export async function getPostRevisions(postId: string, limit = 5): Promise<PostRevisionSummary[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('post_revisions')
    .select('id, post_id, snapshot, created_by, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(revision => ({
    id: revision.id,
    postId: revision.post_id,
    snapshot: revision.snapshot,
    createdBy: revision.created_by,
    createdAt: revision.created_at,
  }))
}
