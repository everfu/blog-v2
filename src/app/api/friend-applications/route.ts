import { NextRequest } from 'next/server'
import { friendApplicationResponse } from '@/server/friends/adapters/http'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return friendApplicationResponse(request)
}

