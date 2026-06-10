import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { CommentStatus, Database } from '@/types/supabase'

export type CommentRow = Database['public']['Tables']['comments']['Row']
type PublicCommentRow = Pick<
  CommentRow,
  'id' | 'page_path' | 'parent_id' | 'author_name' | 'email_hash' | 'website' | 'body' | 'created_at'
>
type AdminCommentRow = PublicCommentRow & Pick<CommentRow, 'status' | 'user_agent'>

export interface PublicComment {
  id: string
  pagePath: string
  parentId: string | null
  authorName: string
  emailHash: string | null
  website: string | null
  body: string
  createdAt: string
}

export interface AdminComment extends PublicComment {
  status: CommentStatus
  userAgent: string | null
}

function mapPublicComment(row: PublicCommentRow): PublicComment {
  return {
    id: row.id,
    pagePath: row.page_path,
    parentId: row.parent_id,
    authorName: row.author_name,
    emailHash: row.email_hash,
    website: row.website,
    body: row.body,
    createdAt: row.created_at,
  }
}

function mapAdminComment(row: AdminCommentRow): AdminComment {
  return {
    ...mapPublicComment(row),
    status: row.status,
    userAgent: row.user_agent,
  }
}

export async function getCommentsByPath(pagePath: string): Promise<PublicComment[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('id,page_path,parent_id,author_name,email_hash,website,body,status,created_at')
    .eq('page_path', pagePath)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map(mapPublicComment)
}

export async function getAdminComments(): Promise<AdminComment[]> {
  if (!isSupabaseAdminConfigured) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('comments')
    .select('id,page_path,parent_id,author_name,email_hash,website,body,status,user_agent,created_at')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(mapAdminComment)
}

export async function getCommentCountByStatus() {
  const comments = await getAdminComments()

  return comments.reduce<Record<CommentStatus, number>>(
    (counts, comment) => {
      counts[comment.status] += 1
      return counts
    },
    { pending: 0, approved: 0, spam: 0, deleted: 0 }
  )
}
