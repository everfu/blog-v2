import { createAtomResponse } from '@/features/feeds'
import { getAllPosts } from '@/features/posts'

export const revalidate = 3600

export async function GET() {
  return createAtomResponse(getAllPosts())
}
