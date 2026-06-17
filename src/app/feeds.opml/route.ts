import { createOpmlResponse } from '@/server/feeds/adapters/http'

export const revalidate = 3600

export async function GET() {
  return await createOpmlResponse('feeds.opml')
}
