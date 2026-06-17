import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { getClientIp } from '@/server/_shared/request/client'
import { hashRequestValue } from '@/server/_shared/request/hash'
import { mapAdminComment } from '../data/mapper'
import { notifyOwnerForNewComment } from '../integrations/email'
import { getCommentAvatarSettings, getEmojiPacks } from './settings'
import { getCommentsByPath } from './public'
import { getCommentLocation, parseUserAgent } from './request-info'
import type { AdminCommentRow } from '../contracts/types'

const commentSchema = z.object({
  pagePath: z.string().min(1).max(240).regex(/^\//),
  postId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  authorName: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(160),
  website: z.string().trim().min(1).max(240),
  body: z.string().trim().min(2).max(2000),
  viewerToken: z.string().trim().min(24).max(160),
})

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type JsonResult =
  | { body: Record<string, unknown>; status?: number }
  | { body: { message: string }; status: number }

function readViewerTokenHash(request: NextRequest) {
  const headerToken = request.headers.get('x-comment-viewer-token')
  const queryToken = request.nextUrl.searchParams.get('viewerToken')
  const token = headerToken || queryToken
  return token ? hashRequestValue(token) : null
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

async function markOwnerNotificationSent(commentId: string) {
  const supabase = createAdminClient()
  await supabase
    .from('comments')
    .update({ notified_owner_at: new Date().toISOString() })
    .eq('id', commentId)
}

export async function getPublicCommentsPayload(request: NextRequest): Promise<JsonResult> {
  const pagePath = request.nextUrl.searchParams.get('path')

  if (!pagePath || !pagePath.startsWith('/')) {
    return { body: { comments: [] }, status: 400 }
  }

  const avatarSettings = await getCommentAvatarSettings()
  const [comments, emojiPacks] = await Promise.all([
    getCommentsByPath(pagePath, {
      viewerTokenHash: readViewerTokenHash(request),
    }, avatarSettings.enabled),
    getEmojiPacks(),
  ])

  return {
    body: {
      comments,
      settings: { emojiPacks, avatar: avatarSettings },
    },
  }
}

export async function submitPublicComment(request: NextRequest): Promise<JsonResult> {
  if (!isSupabaseAdminConfigured) {
    return { body: { message: 'Comments are not configured.' }, status: 503 }
  }

  const body = await request.json().catch(() => null)
  const parsed = commentSchema.safeParse(body)

  if (!parsed.success) {
    return { body: { message: '请完整填写昵称、邮箱、网站地址和评论内容。' }, status: 400 }
  }

  let website: string
  try {
    website = new URL(normalizeWebsite(parsed.data.website)).toString()
  } catch {
    return { body: { message: '网站地址格式不正确。' }, status: 400 }
  }

  const supabase = createAdminClient()
  const normalizedEmail = parsed.data.email.trim().toLowerCase()
  const emailHash = hashRequestValue(normalizedEmail)
  const ipHash = hashRequestValue(getClientIp(request))
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', tenMinutesAgo)

  if ((count || 0) >= 5) {
    return { body: { message: '评论太快了，稍后再试。' }, status: 429 }
  }

  const userAgent = request.headers.get('user-agent')
  const ua = parseUserAgent(userAgent)
  const location = getCommentLocation(request)
  const { data, error } = await supabase
    .from('comments')
    .insert({
      page_path: parsed.data.pagePath,
      post_id: parsed.data.postId || null,
      parent_id: parsed.data.parentId || null,
      author_name: parsed.data.authorName,
      author_email: normalizedEmail,
      email_hash: emailHash,
      website,
      body: parsed.data.body,
      status: 'pending',
      ip_hash: ipHash,
      user_agent: userAgent,
      auth_mode: 'email',
      location_label: location.label,
      ua_browser: ua.browser,
      ua_browser_version: ua.browserVersion || null,
      ua_os: ua.os,
      ua_device: ua.device,
      ua_request_id: null,
      viewer_token_hash: hashRequestValue(parsed.data.viewerToken),
      metadata: {},
    })
    .select('id,page_path,post_id,parent_id,author_name,author_email,email_hash,website,body,status,auth_mode,location_label,ua_browser,ua_browser_version,ua_os,ua_device,ua_request_id,like_count,viewer_token_hash,user_agent,ip_hash,notified_owner_at,notified_reply_at,created_at')
    .single()

  if (error || !data) {
    console.error('Comment insert failed', error)
    return { body: { message: '评论提交失败。' }, status: 500 }
  }

  const adminComment = mapAdminComment(data as unknown as AdminCommentRow)
  try {
    const sent = await notifyOwnerForNewComment(adminComment)
    if (sent) await markOwnerNotificationSent(adminComment.id)
  } catch (notificationError) {
    console.error('Failed to send new comment notification', notificationError)
  }

  const avatarSettings = await getCommentAvatarSettings()

  return {
    body: {
      comment: {
        id: adminComment.id,
        pagePath: adminComment.pagePath,
        postId: adminComment.postId,
        parentId: adminComment.parentId,
        authorName: adminComment.authorName,
        authorAvatarUrl: avatarSettings.enabled ? `https://weavatar.com/avatar/${adminComment.emailHash}` : null,
        emailHash: adminComment.emailHash,
        website: adminComment.website,
        body: adminComment.body,
        authMode: adminComment.authMode,
        locationLabel: adminComment.locationLabel,
        uaSummary: adminComment.uaSummary,
        likeCount: 0,
        status: adminComment.status,
        isOwnPending: true,
        createdAt: adminComment.createdAt,
      },
      status: adminComment.status,
    },
    status: 201,
  }
}

export async function recordCommentLike(request: NextRequest, commentId: string): Promise<JsonResult> {
  if (!isSupabaseAdminConfigured) {
    return { body: { message: 'Comment likes are not configured.' }, status: 503 }
  }

  if (!uuidPattern.test(commentId)) {
    return { body: { message: 'Invalid comment id.' }, status: 400 }
  }

  const ipHash = hashRequestValue(getClientIp(request))
  const userAgentHash = hashRequestValue(request.headers.get('user-agent') || 'unknown')
  const visitorHash = hashRequestValue(`${ipHash}:${userAgentHash}`)
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('record_comment_like', {
    p_comment_id: commentId,
    p_visitor_hash: visitorHash,
    p_ip_hash: ipHash,
    p_user_agent_hash: userAgentHash,
  })
  const metrics = Array.isArray(data) ? data[0] : null

  if (error) {
    console.error('Comment like update failed', error)
    return {
      body: {
        message: error.code === 'PGRST202' ? '缺少评论点赞数据库函数，请先应用迁移。' : '点赞失败。',
      },
      status: 500,
    }
  }

  if (!metrics) {
    return { body: { message: '评论不存在或尚未公开。' }, status: 404 }
  }

  return {
    body: {
      liked: metrics.liked,
      likeCount: metrics.like_count,
    },
  }
}

