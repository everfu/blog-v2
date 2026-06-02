import { createOpmlResponse } from '@/features/feeds'

export const revalidate = 3600

export async function GET() {
  return createOpmlResponse('efu.opml')
}
