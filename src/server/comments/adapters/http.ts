import type { NextRequest } from 'next/server'
import { getEmojiPacks } from '../application/settings'
import { getPublicCommentsPayload, recordCommentLike, submitPublicComment } from '../application/http'

export async function publicCommentsResponse(request: NextRequest) {
  const result = await getPublicCommentsPayload(request)
  return Response.json(result.body, { status: result.status || 200 })
}

export async function submitCommentResponse(request: NextRequest) {
  const result = await submitPublicComment(request)
  return Response.json(result.body, { status: result.status || 200 })
}

export async function commentLikeResponse(request: NextRequest, commentId: string) {
  const result = await recordCommentLike(request, commentId)
  return Response.json(result.body, { status: result.status || 200 })
}

export async function commentSettingsResponse() {
  const emojiPacks = await getEmojiPacks()
  return Response.json({ emojiPacks })
}

