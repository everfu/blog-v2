import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapPublicComment } from '../data/mapper'
import type { PublicComment, PublicCommentRow } from '../contracts/types'

interface PublicCommentViewer {
  viewerTokenHash: string | null
}

function buildAvatarUrl(emailHash: string | null, avatarEnabled: boolean) {
  if (!avatarEnabled || !emailHash) return null
  return `https://weavatar.com/avatar/${emailHash}`
}

function sortPublicComments(comments: PublicComment[]) {
  return comments.sort((a, b) => {
    if (a.parentId && b.parentId && a.parentId === b.parentId) {
      return new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
    }

    return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
  })
}

export async function getCommentsByPath(
  pagePath: string,
  viewer: PublicCommentViewer = { viewerTokenHash: null },
  avatarEnabled = true
): Promise<PublicComment[]> {
  if (!isSupabaseConfigured || !isSupabaseAdminConfigured) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('comments')
    .select('id,page_path,post_id,parent_id,author_name,email_hash,website,body,status,auth_mode,location_label,ua_browser,ua_browser_version,ua_os,ua_device,like_count,viewer_token_hash,created_at')
    .eq('page_path', pagePath)
    .or('status.eq.approved,status.eq.pending')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  const rows = (data as unknown as PublicCommentRow[]).filter(comment => {
    if (comment.status === 'approved') return true
    if (comment.status !== 'pending') return false
    return Boolean(viewer.viewerTokenHash && comment.viewer_token_hash === viewer.viewerTokenHash)
  })

  return sortPublicComments(rows.map(comment => mapPublicComment(comment, {
    authorAvatarUrl: buildAvatarUrl(comment.email_hash, avatarEnabled),
    isOwnPending: comment.status === 'pending' && Boolean(viewer.viewerTokenHash && comment.viewer_token_hash === viewer.viewerTokenHash),
  })))
}

export async function getApprovedCommentCountByPath(pagePath: string): Promise<number> {
  if (!isSupabaseConfigured || !isSupabaseAdminConfigured) return 0

  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('page_path', pagePath)
    .eq('status', 'approved')

  if (error) return 0
  return count || 0
}
