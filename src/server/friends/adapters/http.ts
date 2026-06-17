import type { NextRequest } from 'next/server'
import { submitFriendApplication } from '../application/applications'

export async function friendApplicationResponse(request: NextRequest) {
  const result = await submitFriendApplication(request)
  return Response.json(result.body, { status: result.status || 200 })
}

