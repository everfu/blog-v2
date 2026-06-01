import { createOpmlResponse } from '@/features/feeds'

export const dynamic = 'force-dynamic'

export async function GET() {
  return createOpmlResponse('feeds.opml')
}
