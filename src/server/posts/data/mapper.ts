import type { Post, PostMetadata, PostRow } from '../contracts/types'

export const postSelect = `
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
  view_count,
  like_count,
  published_at,
  created_at,
  updated_at
`

export function mapPost(row: PostRow): Post {
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
    viewCount: row.view_count,
    likeCount: row.like_count,
    reactions: {},
    content: row.content,
    status: row.status,
    updatedAt: row.updated_at,
  }
}

export function toMetadata({ content, ...metadata }: Post): PostMetadata {
  return metadata
}

export function sortByDateDesc<T extends { date: string }>(posts: T[]) {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
