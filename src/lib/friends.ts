import { feedEntries } from '@/data/feeds'
import { parseFeedXml } from '@/lib/parseFeed'
import type { FeedEntry, FriendItem, FriendSourceStatus, FriendsResponse } from '@/types/feed'

const PER_FEED_LIMIT = 10
const TOTAL_LIMIT = 100
const FETCH_TIMEOUT_MS = 8000

function flattenFeedEntries() {
  return feedEntries.filter((entry): entry is FeedEntry & { feed: string } => Boolean(entry.feed))
}

async function fetchOne(entry: FeedEntry & { feed: string }): Promise<{ items: FriendItem[]; status: FriendSourceStatus }> {
  const status: FriendSourceStatus = {
    author: entry.author,
    sitenick: entry.sitenick,
    siteLink: entry.link,
    feed: entry.feed,
    ok: false,
    count: 0,
  }

  try {
    const response = await fetch(entry.feed, {
      headers: {
        Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
        'User-Agent': `cube-blog-friends/1.0 (+${entry.link})`,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const xml = await response.text()
    const items = parseFeedXml(xml, PER_FEED_LIMIT)
      .filter(item => item.pubDate)
      .map<FriendItem>(item => ({
        author: entry.author,
        sitenick: entry.sitenick,
        avatar: entry.avatar,
        siteLink: entry.link,
        archs: entry.archs,
        title: item.title,
        link: item.link,
        summary: item.summary,
        cover: item.cover,
        pubDate: item.pubDate,
      }))

    status.ok = true
    status.count = items.length

    return { items, status }
  } catch (error) {
    status.error = error instanceof Error ? error.message : String(error)
    return { items: [], status }
  }
}

export async function aggregateFriends(): Promise<FriendsResponse> {
  const results = await Promise.all(flattenFeedEntries().map(fetchOne))
  const items = results
    .flatMap(result => result.items)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, TOTAL_LIMIT)

  return {
    items,
    sources: results.map(result => result.status),
    generatedAt: new Date().toISOString(),
  }
}
