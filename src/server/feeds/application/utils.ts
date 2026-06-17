import type { FeedEntry } from '@/types/feed'

const FAVICON_HOST = 'https://unavatar.webp.se/google/'

export const DEFAULT_FRIEND_AVATAR = '/mstile-150x150.png'

export function getFriendFavicon(url: string) {
  try {
    const hostname = new URL(url).hostname
    return `${FAVICON_HOST}${hostname}?s=32`
  } catch {
    return DEFAULT_FRIEND_AVATAR
  }
}

export function getFriendAvatar(entry: Pick<FeedEntry, 'avatar' | 'icon'>) {
  return entry.avatar || entry.icon || DEFAULT_FRIEND_AVATAR
}
