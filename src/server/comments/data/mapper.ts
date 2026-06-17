import { buildUserAgentSummary } from '../application/request-info'
import type { AdminComment, AdminCommentRow, PublicComment, PublicCommentRow } from '../contracts/types'

export function mapPublicComment(
  row: PublicCommentRow,
  options: {
    authorAvatarUrl?: string | null
    isOwnPending?: boolean
  } = {}
): PublicComment {
  const uaSummary = buildUserAgentSummary({
    browser: row.ua_browser,
    browserVersion: row.ua_browser_version,
    os: row.ua_os,
    device: row.ua_device,
  })

  return {
    id: row.id,
    pagePath: row.page_path,
    postId: row.post_id,
    parentId: row.parent_id,
    authorName: row.author_name,
    authorAvatarUrl: options.authorAvatarUrl ?? null,
    emailHash: row.email_hash,
    website: row.website,
    body: row.body,
    authMode: row.auth_mode,
    locationLabel: row.location_label,
    uaSummary,
    likeCount: row.like_count || 0,
    status: row.status,
    isOwnPending: options.isOwnPending ?? false,
    createdAt: row.created_at,
  }
}

export function mapAdminComment(row: AdminCommentRow): AdminComment {
  return {
    ...mapPublicComment(row),
    authorEmail: row.author_email,
    userAgent: row.user_agent,
    uaRequestId: row.ua_request_id,
    notifiedOwnerAt: row.notified_owner_at,
    notifiedReplyAt: row.notified_reply_at,
  }
}
