import type { NextRequest } from 'next/server'
import { recordPostLike, recordPostReaction, recordPostView } from '../application/interactions'

export async function postViewResponse(postId: string) {
  const result = await recordPostView(postId)
  return Response.json(result.body, { status: result.status || 200 })
}

export async function postLikeResponse(request: NextRequest, postId: string) {
  const result = await recordPostLike(request, postId)
  return Response.json(result.body, { status: result.status || 200 })
}

export async function postReactionResponse(request: NextRequest, postId: string) {
  const emoji = new URL(request.url).searchParams.get('emoji') || ''
  const result = await recordPostReaction(request, postId, emoji)
  return Response.json(result.body, { status: result.status || 200 })
}

