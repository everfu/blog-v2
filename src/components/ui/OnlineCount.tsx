'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { createClient as createSupabaseClient } from '@/lib/supabase/browser'
import { isSupabaseConfigured } from '@/lib/supabase/config'

const PRESENCE_CHANNEL = 'site:presence'
const MAX_VISIBLE_PAGES = 8

type VisitorPresence = {
  tabId: string
  pathname: string
  title: string
  trackedAt: string
}

type PagePresence = {
  key: string
  pathname: string
  title: string
  count: number
}

const FALLBACK_TITLES: Record<string, string> = {
  '/': siteConfig.name,
  '/posts': 'Posts',
  '/stack': 'Stack',
  '/album': 'Album',
  '/links': 'Links',
  '/friends': 'Friends',
}

const TITLE_SELECTORS = [
  '[data-presence-title]',
  'article h1',
  'main h1',
  'main .section-title span',
  'main .section-title',
] as const

function formatPathname(pathname: string) {
  if (pathname === '/') return 'Home'
  return pathname
}

function createTabId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getPageTitle(pathname: string) {
  const fallback = FALLBACK_TITLES[pathname] ?? 'Page'

  if (typeof document === 'undefined') return fallback

  for (const selector of TITLE_SELECTORS) {
    const title = document.querySelector(selector)?.textContent?.trim()
    if (title) return title
  }

  const suffixes = [` | ${siteConfig.name}`, ` - ${siteConfig.name}`]
  const rawTitle = document.title.trim()
  const title = suffixes.reduce(
    (value, suffix) => value.endsWith(suffix) ? value.slice(0, -suffix.length).trim() : value,
    rawTitle
  )

  return title || fallback
}

function buildPresence(pathname: string): VisitorPresence {
  return {
    tabId: '',
    pathname,
    title: getPageTitle(pathname),
    trackedAt: new Date().toISOString(),
  }
}

function buildCurrentPresence(tabId: string) {
  return {
    ...buildPresence(window.location.pathname),
    tabId,
  }
}

function equalPresence(a: VisitorPresence | null, b: VisitorPresence) {
  return Boolean(
    a &&
    a.tabId === b.tabId &&
    a.pathname === b.pathname &&
    a.title === b.title
  )
}

function scheduleTitleTrack({
  channel,
  pathname,
  tabId,
  latestPresenceRef,
}: {
  channel: RealtimeChannel
  pathname: string
  tabId: string
  latestPresenceRef: React.MutableRefObject<VisitorPresence | null>
}) {
  const presence = {
    ...buildPresence(pathname),
    tabId,
  }

  if (equalPresence(latestPresenceRef.current, presence)) return

  latestPresenceRef.current = presence
  void channel.track(presence)
}

function readPages(channel: RealtimeChannel): PagePresence[] {
  const state = channel.presenceState<VisitorPresence>()
  const latestByTab = new Map<string, VisitorPresence>()

  Object.values(state).flat().forEach((presence) => {
    if (!presence.tabId || !presence.pathname || !presence.title) return

    const current = latestByTab.get(presence.tabId)
    if (!current || new Date(presence.trackedAt).getTime() >= new Date(current.trackedAt).getTime()) {
      latestByTab.set(presence.tabId, presence)
    }
  })

  const grouped = new Map<string, PagePresence>()

  latestByTab.forEach((presence) => {
    const key = `${presence.pathname}:${presence.title}`
    const current = grouped.get(key)

    if (current) {
      current.count += 1
      return
    }

    grouped.set(key, {
      key,
      pathname: presence.pathname,
      title: presence.title,
      count: 1,
    })
  })

  return Array.from(grouped.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.title.localeCompare(b.title)
  })
}

export default function OnlineCount() {
  const pathname = usePathname()
  const tabId = useMemo(() => createTabId(), [])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const latestPresenceRef = useRef<VisitorPresence | null>(null)
  const [pages, setPages] = useState<PagePresence[]>([])
  const [subscribed, setSubscribed] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!subscribed || !channelRef.current) return undefined

    const channel = channelRef.current
    const delays = [0, 100, 300, 700]
    const timers = delays.map((delay) => window.setTimeout(() => {
      scheduleTitleTrack({
        channel,
        pathname,
        tabId,
        latestPresenceRef,
      })
    }, delay))

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [pathname, subscribed, tabId])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    const supabase = createSupabaseClient()
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: tabId,
        },
      },
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        setPages(readPages(channel))
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return

        setSubscribed(true)
        await channel.track(latestPresenceRef.current ?? buildCurrentPresence(tabId))
      })

    return () => {
      setSubscribed(false)
      channelRef.current = null
      void channel.untrack()
      void supabase.removeChannel(channel)
    }
  }, [tabId])

  const count = pages.reduce((total, page) => total + page.count, 0)

  if (!isSupabaseConfigured || count === 0) return null

  const visiblePages = pages.slice(0, MAX_VISIBLE_PAGES)
  const hiddenPageCount = Math.max(0, pages.length - visiblePages.length)

  return (
    <span
      className="group relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHovered(false)
        }
      }}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
        aria-label={`${count} online`}
        aria-expanded={hovered}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        {count} online
      </button>

      <span className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 block w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 border border-border bg-card text-left text-foreground shadow-lg transition-all duration-150 ${hovered ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'}`}>
        <span className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
          <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-muted">
            Now reading
          </span>
          <span className="text-[11px] text-muted tabular-nums">
            {count} online
          </span>
        </span>

        <span className="block space-y-2 px-3 py-3">
          {visiblePages.map((page) => (
            <span key={page.key} className="grid grid-cols-[1fr_auto] items-start gap-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium leading-5" title={page.title}>
                  {page.title}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wide text-muted/75" title={page.pathname}>
                  {formatPathname(page.pathname)}
                </span>
              </span>
              <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center border border-border bg-background px-1.5 text-[11px] text-muted tabular-nums">
                {page.count}
              </span>
            </span>
          ))}
          {hiddenPageCount > 0 && (
            <span className="block border-t border-border pt-2 text-[11px] text-muted">
              + {hiddenPageCount} more pages
            </span>
          )}
        </span>
      </span>
    </span>
  )
}
