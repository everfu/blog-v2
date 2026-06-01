import { aggregateFriends } from '@/lib/friends'

export const dynamic = 'force-dynamic'

export async function GET() {
  const response = await aggregateFriends()

  return Response.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
    },
  })
}
