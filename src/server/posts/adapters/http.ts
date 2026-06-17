import type { NextRequest } from 'next/server'
import { recordPostLike, recordPostView } from '../application/interactions'

export async function postViewResponse(postId: string) {
  const result = await recordPostView(postId)
  return Response.json(result.body, { status: result.status || 200 })
}

export async function postLikeResponse(request: NextRequest, postId: string) {
  const result = await recordPostLike(request, postId)
  return Response.json(result.body, { status: result.status || 200 })
}

