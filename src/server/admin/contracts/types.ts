import type { Json } from '@/types/supabase'
import type { AdminComment } from '@/server/comments/contracts/types'
import type { AdminPost } from '@/server/posts/contracts/types'

export interface AdminAuditLog {
  id: string
  actorId: string | null
  action: string
  entityType: string
  entityId: string | null
  metadata: Json
  createdAt: string
}

export interface AdminDashboardSummary {
  postTotal: number
  publishedPosts: number
  draftPosts: number
  archivedPosts: number
  commentTotal: number
  pendingComments: number
  approvedComments: number
  spamComments: number
  recentPosts: AdminPost[]
  pendingCommentItems: AdminComment[]
  auditLogs: AdminAuditLog[]
}

export interface AdminDashboardSource {
  posts: AdminPost[]
  comments: AdminComment[]
  auditLogs: AdminAuditLog[]
}
