import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { mapPost, postSelect, sortByDateDesc, toMetadata } from '../data/mapper'
import type { Post, PostMetadata } from '../contracts/types'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '👏', '🤔'] as const

async function fetchReactionsByPostIds(postIds: string[]): Promise<Map<string, Record<string, number>>> {
  const result = new Map<string, Record<string, number>>()
  if (!isSupabaseAdminConfigured || postIds.length === 0) return result

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('post_reactions')
    .select('post_id, emoji')
    .in('post_id', postIds)

  if (error || !data) return result

  for (const row of data) {
    const current = result.get(row.post_id) ?? {}
    current[row.emoji] = (current[row.emoji] ?? 0) + 1
    result.set(row.post_id, current)
  }
  return result
}

function ensureAllEmojis(record: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const e of REACTION_EMOJIS) {
    out[e] = record[e] ?? 0
  }
  return { ...record, ...out }
}

async function fetchAllPosts(): Promise<PostMetadata[]> {
  if (!isSupabaseAdminConfigured) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error || !data) return []

  const posts = data.map(mapPost)
  const reactionsMap = await fetchReactionsByPostIds(posts.map(p => p.id))
  for (const post of posts) {
    post.reactions = ensureAllEmojis(reactionsMap.get(post.id) ?? {})
  }
  return sortByDateDesc(posts.map(toMetadata))
}

export const getAllPosts = unstable_cache(fetchAllPosts, ['published-posts'], {
  tags: ['posts', 'home'],
  revalidate: 300,
})

export async function getRecentPosts(limit?: number): Promise<PostMetadata[]> {
  const posts = (await getAllPosts()).filter(post => post.recent)
  return typeof limit === 'number' ? posts.slice(0, limit) : posts
}

export async function getMorePosts(): Promise<PostMetadata[]> {
  return (await getAllPosts()).filter(post => !post.recent)
}

async function fetchPostBySlug(
  year: string,
  slug: string
): Promise<Post | null> {
  if (!isSupabaseAdminConfigured || !/^\d{4}$/.test(year)) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('status', 'published')
    .eq('year', Number(year))
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null

  const post = mapPost(data)
  const reactionsMap = await fetchReactionsByPostIds([post.id])
  post.reactions = ensureAllEmojis(reactionsMap.get(post.id) ?? {})
  return post
}

export const getPostBySlug = unstable_cache(fetchPostBySlug, ['post-by-slug'], {
  tags: ['posts'],
  revalidate: 300,
})
