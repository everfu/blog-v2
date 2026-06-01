import { createAtomResponse } from '@/features/feeds'
import { getAllPosts } from '@/features/posts'

export const dynamic = 'force-dynamic'

export async function GET() {
  return createAtomResponse(getAllPosts())
}
