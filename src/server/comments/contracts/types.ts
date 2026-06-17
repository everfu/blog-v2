import type { CommentAuthMode, CommentStatus, Database, Json } from '@/types/supabase'

export type CommentRow = Database['public']['Tables']['comments']['Row']
export type CommentSettingsRow = Database['public']['Tables']['comment_settings']['Row']

export type PublicCommentRow = Pick<
  CommentRow,
  | 'id'
  | 'page_path'
  | 'post_id'
  | 'parent_id'
  | 'author_name'
  | 'email_hash'
  | 'website'
  | 'body'
  | 'status'
  | 'auth_mode'
  | 'location_label'
  | 'ua_browser'
  | 'ua_browser_version'
  | 'ua_os'
  | 'ua_device'
  | 'like_count'
  | 'viewer_token_hash'
  | 'created_at'
>

export type AdminCommentRow = PublicCommentRow & Pick<
  CommentRow,
  | 'author_email'
  | 'user_agent'
  | 'ip_hash'
  | 'ua_request_id'
  | 'notified_owner_at'
  | 'notified_reply_at'
  | 'created_at'
>

export interface PublicComment {
  id: string
  pagePath: string
  postId: string | null
  parentId: string | null
  authorName: string
  authorAvatarUrl: string | null
  emailHash: string | null
  website: string | null
  body: string
  authMode: CommentAuthMode
  locationLabel: string | null
  uaSummary: string | null
  likeCount: number
  status: CommentStatus
  isOwnPending: boolean
  createdAt: string
}

export interface AdminComment extends PublicComment {
  authorEmail: string | null
  userAgent: string | null
  uaRequestId: string | null
  notifiedOwnerAt: string | null
  notifiedReplyAt: string | null
}

export type AdminCommentSort = 'newest' | 'oldest' | 'likes'

export interface AdminCommentFilters {
  status?: CommentStatus | 'all'
  keyword?: string
  pagePath?: string
  createdFrom?: string
  createdTo?: string
  sort?: AdminCommentSort
}

export interface AdminCommentSummary {
  total: number
  pending: number
  approved: number
  spam: number
  deleted: number
  filtered: number
}

export interface CommentSmtpSettings {
  enabled: boolean
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromName: string
  fromEmail: string
  ownerEmail: string
}

export interface CommentSettingsPayload {
  value: Json
}
