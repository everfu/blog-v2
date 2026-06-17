import { commentSettingsResponse } from '@/server/comments/adapters/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  return commentSettingsResponse()
}
