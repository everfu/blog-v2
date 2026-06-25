import { NextRequest } from 'next/server'
import { postReactionResponse } from '@/server/posts/adapters/http'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  return postReactionResponse(request, id)
}
