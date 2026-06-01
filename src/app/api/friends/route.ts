import { getCachedFriends } from '@/features/feeds'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await getCachedFriends()

    return Response.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
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
