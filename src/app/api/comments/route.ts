import { NextRequest } from 'next/server'
import { publicCommentsResponse, submitCommentResponse } from '@/server/comments/adapters/http'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return publicCommentsResponse(request)
}

export async function POST(request: NextRequest) {
  return submitCommentResponse(request)
}
