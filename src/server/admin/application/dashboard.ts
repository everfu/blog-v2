import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { getAdminComments } from '@/server/comments/adapters/page'
import { getAdminPosts } from '@/server/posts/adapters/admin'
import { getAdminUsers } from '@/server/users/adapters/page'
import type { AdminAuditLog, AdminDashboardSummary } from '../contracts/types'

export async function getRecentAdminAuditLogs(limit = 8): Promise<AdminAuditLog[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('id, actor_id, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(log => ({
    id: log.id,
    actorId: log.actor_id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    metadata: log.metadata,
    createdAt: log.created_at,
  }))
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [posts, comments, users, auditLogs] = await Promise.all([
    getAdminPosts(),
    getAdminComments({ status: 'all' }),
    getAdminUsers(),
    getRecentAdminAuditLogs(8),
  ])

  return {
    postTotal: posts.length,
    publishedPosts: posts.filter(post => post.status === 'published').length,
    draftPosts: posts.filter(post => post.status === 'draft').length,
    archivedPosts: posts.filter(post => post.status === 'archived').length,
    commentTotal: comments.length,
    pendingComments: comments.filter(comment => comment.status === 'pending').length,
    approvedComments: comments.filter(comment => comment.status === 'approved').length,
    spamComments: comments.filter(comment => comment.status === 'spam').length,
    userTotal: users.length,
    adminTotal: users.filter(user => user.role === 'admin').length,
    recentPosts: posts.slice(0, 6),
    pendingCommentItems: comments.filter(comment => comment.status === 'pending').slice(0, 5),
    auditLogs,
  }
}
