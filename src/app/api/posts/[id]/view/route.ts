import { NextRequest } from 'next/server'
import { postViewResponse } from '@/server/posts/adapters/http'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  return postViewResponse(id)
}
