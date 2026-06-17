import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { mapPost, postSelect, sortByDateDesc, toMetadata } from '../data/mapper'
import type { Post, PostMetadata } from '../contracts/types'

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

  return sortByDateDesc(data.map(mapPost).map(toMetadata))
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

  return mapPost(data)
}

export const getPostBySlug = unstable_cache(fetchPostBySlug, ['post-by-slug'], {
  tags: ['posts'],
  revalidate: 300,
})
