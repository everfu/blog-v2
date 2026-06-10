import { cache } from 'react'
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Database, PostStatus } from '@/types/supabase'
export { getPostHref } from './routes'

type PostRow = Database['public']['Tables']['posts']['Row']

export interface Post {
  id: string
  year: string
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  cover?: string
  category: string
  recent: boolean
  content: string
  status: PostStatus
  updatedAt: string
}

export interface PostMetadata {
  id: string
  year: string
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  cover?: string
  category: string
  recent: boolean
  status: PostStatus
  updatedAt: string
}

export type AdminPost = Post

const postSelect = `
  id,
  slug,
  year,
  title,
  excerpt,
  content,
  tags,
  cover,
  category,
  status,
  recent,
  published_at,
  created_at,
  updated_at
`

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    year: String(row.year),
    slug: row.slug,
    title: row.title,
    date: row.published_at || row.created_at,
    excerpt: row.excerpt,
    tags: row.tags || [],
    cover: row.cover || undefined,
    category: row.category,
    recent: row.recent,
    content: row.content,
    status: row.status,
    updatedAt: row.updated_at,
  }
}

const toMetadata = ({ content, ...metadata }: Post): PostMetadata => metadata

function sortByDateDesc<T extends { date: string }>(posts: T[]) {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const getAllPosts = cache(async function getAllPosts(): Promise<PostMetadata[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return sortByDateDesc(data.map(mapPost).map(toMetadata))
})

export async function getRecentPosts(limit?: number): Promise<PostMetadata[]> {
  const posts = (await getAllPosts()).filter(post => post.recent)
  return typeof limit === 'number' ? posts.slice(0, limit) : posts
}

export async function getMorePosts(): Promise<PostMetadata[]> {
  return (await getAllPosts()).filter(post => !post.recent)
}

export const getPostBySlug = cache(async function getPostBySlug(
  year: string,
  slug: string
): Promise<Post | null> {
  if (!isSupabaseConfigured || !/^\d{4}$/.test(year)) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('status', 'published')
    .eq('year', Number(year))
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null

  return mapPost(data)
})

export async function getAdminPosts(): Promise<AdminPost[]> {
  if (!isSupabaseAdminConfigured) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .order('updated_at', { ascending: false })

  if (error || !data) return []

  return data.map(mapPost)
}

export async function getAdminPostById(id: string): Promise<AdminPost | null> {
  if (!isSupabaseAdminConfigured) return null

  const supabase = createAdminClient()
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
