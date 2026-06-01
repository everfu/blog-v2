import { createOpmlResponse } from '@/lib/opml'

export const dynamic = 'force-dynamic'

export async function GET() {
  return createOpmlResponse('feeds.opml')
}
