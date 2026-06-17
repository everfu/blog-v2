import { getFriendsSnapshot } from '@/server/friends/adapters/page'

export const revalidate = 300

export async function GET() {
  try {
    const response = await getFriendsSnapshot()

    return Response.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch {
    return Response.json({
      items: [],
      sources: [],
      generatedAt: new Date().toISOString(),
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  }
}
