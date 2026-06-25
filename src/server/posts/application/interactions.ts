import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { getClientIp } from '@/server/_shared/request/client'
import { hashRequestValue } from '@/server/_shared/request/hash'
import type { NextRequest } from 'next/server'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type PostInteractionResult =
  | { ok: true; body: Record<string, unknown>; status?: number }
  | { ok: false; body: { message: string }; status: number }

export async function recordPostView(postId: string): Promise<PostInteractionResult> {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, body: { message: 'Post metrics are not configured.' }, status: 503 }
  }

  if (!uuidPattern.test(postId)) {
    return { ok: false, body: { message: 'Invalid post id.' }, status: 400 }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('increment_post_view', {
    p_post_id: postId,
  })
  const metrics = Array.isArray(data) ? data[0] : null

  if (error) {
    return { ok: false, body: { message: 'View count update failed.' }, status: 500 }
  }

  if (!metrics) {
    return { ok: false, body: { message: 'Post not found.' }, status: 404 }
  }

  return {
    ok: true,
    body: {
      viewCount: metrics.view_count,
      likeCount: metrics.like_count,
    },
  }
}

export async function recordPostLike(request: NextRequest, postId: string): Promise<PostInteractionResult> {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, body: { message: 'Post metrics are not configured.' }, status: 503 }
  }

  if (!uuidPattern.test(postId)) {
    return { ok: false, body: { message: 'Invalid post id.' }, status: 400 }
  }

  const ipHash = hashRequestValue(getClientIp(request))
  const userAgentHash = hashRequestValue(request.headers.get('user-agent') || 'unknown')
  const visitorHash = hashRequestValue(`${ipHash}:${userAgentHash}`)
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('record_post_like', {
    p_post_id: postId,
    p_visitor_hash: visitorHash,
    p_ip_hash: ipHash,
    p_user_agent_hash: userAgentHash,
  })
  const metrics = Array.isArray(data) ? data[0] : null

  if (error) {
    return { ok: false, body: { message: 'Like update failed.' }, status: 500 }
  }

  if (!metrics) {
    return { ok: false, body: { message: 'Post not found.' }, status: 404 }
  }

  return {
    ok: true,
    body: {
      liked: metrics.liked,
      viewCount: metrics.view_count,
      likeCount: metrics.like_count,
    },
  }
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '👏', '🤔'] as const

export async function recordPostReaction(
  request: NextRequest,
  postId: string,
  emoji: string,
): Promise<PostInteractionResult> {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, body: { message: 'Reactions are not configured.' }, status: 503 }
  }

  if (!uuidPattern.test(postId)) {
    return { ok: false, body: { message: 'Invalid post id.' }, status: 400 }
  }

  if (!REACTION_EMOJIS.includes(emoji as (typeof REACTION_EMOJIS)[number])) {
    return { ok: false, body: { message: 'Invalid emoji.' }, status: 400 }
  }

  const ipHash = hashRequestValue(getClientIp(request))
  const userAgentHash = hashRequestValue(request.headers.get('user-agent') || 'unknown')
  const visitorHash = hashRequestValue(`${ipHash}:${userAgentHash}`)
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('record_post_reaction', {
    p_post_id: postId,
    p_emoji: emoji,
    p_visitor_hash: visitorHash,
    p_ip_hash: ipHash,
    p_user_agent_hash: userAgentHash,
  })

  if (error) {
    return { ok: false, body: { message: 'Reaction update failed.' }, status: 500 }
  }

  const result = Array.isArray(data) ? data[0] : null
  if (!result) {
    return { ok: false, body: { message: 'Post not found.' }, status: 404 }
  }

  return {
    ok: true,
    body: {
      reacted: result.reacted,
      reactions: (result.reactions as Record<string, number> | null) ?? {},
    },
  }
}

