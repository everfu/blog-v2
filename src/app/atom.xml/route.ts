import { createAtomResponse } from '@/features/feeds'
import { getAllPosts } from '@/features/posts'

export const revalidate = 300

export async function GET() {
  return createAtomResponse(await getAllPosts())
}
