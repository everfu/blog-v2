import { createAtomResponse } from '@/server/feeds/adapters/http'
import { getAllPosts } from '@/server/posts/adapters/page'

export const revalidate = 300

export async function GET() {
  return createAtomResponse(await getAllPosts())
}
