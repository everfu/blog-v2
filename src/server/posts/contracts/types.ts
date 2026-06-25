import type { Database, Json, PostStatus } from '@/types/supabase'

export type PostRow = Database['public']['Tables']['posts']['Row']

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
  viewCount: number
  likeCount: number
  reactions: Record<string, number>
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
  viewCount: number
  likeCount: number
  reactions: Record<string, number>
  status: PostStatus
  updatedAt: string
}

export type AdminPost = Post

export interface AdminPostFilters {
  status?: PostStatus | 'all'
  keyword?: string
  year?: string
  category?: string
  recent?: boolean
}

export interface PostRevisionSummary {
  id: string
  postId: string
  createdBy: string | null
  createdAt: string
  snapshot: Json
}
