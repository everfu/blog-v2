'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FriendItem, FriendsResponse } from '@/types/feed'
import { DEFAULT_FRIEND_AVATAR } from '@/server/feeds/application/utils'
import { formatDate } from '@/lib/utils'
import { siteConfig } from '@/config/site'

interface FriendsClientProps {
  initialData?: FriendsResponse
}

const ALL_AUTHORS = 'ALL'
const INITIAL_VISIBLE_COUNT = siteConfig.friends.initialVisibleCount
const VISIBLE_INCREMENT = siteConfig.friends.visibleIncrement

function getAuthorLabel(item: Pick<FriendItem, 'author' | 'sitenick'>) {
  return item.sitenick || item.author
}

function SkeletonBar({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse bg-border ${className}`} />
}

function ToolbarSkeleton() {
  return (
    <section className="border-y border-border py-4">
      <div className="mb-4 flex flex-wrap gap-3">
        <SkeletonBar className="h-4 w-20" />
        <SkeletonBar className="h-4 w-24" />
        <SkeletonBar className="h-4 w-28" />
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_42px]">
        <SkeletonBar className="h-10 w-full" />
        <SkeletonBar className="h-10 w-full" />
        <SkeletonBar className="h-10 w-full" />
      </div>
    </section>
  )
}

function ArticleSkeleton() {
  return (
    <article className="border-b border-border pb-5">
      <div className="flex items-center gap-3">
        <SkeletonBar className="h-9 w-9 rounded-full" />
        <div className="flex-1">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="mt-2 h-3 w-20" />
        </div>
      </div>
      <SkeletonBar className="mt-5 h-5 w-5/6" />
      <SkeletonBar className="mt-3 h-3 w-full" />
      <SkeletonBar className="mt-2 h-3 w-3/4" />
    </article>
  )
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
      {children}
    </span>
  )
}

function FriendArticleCard({ item }: { item: FriendItem }) {
  const authorLabel = getAuthorLabel(item)
  const hasCover = Boolean(item.cover)
  const avatar = item.avatar || DEFAULT_FRIEND_AVATAR

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-b border-border pb-5 transition-opacity hover:opacity-100"
    >
      <article className={hasCover ? 'grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]' : ''}>
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Remote feed avatars can be SVGs, so keep them outside Next Image optimization. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt={authorLabel}
                width={34}
                height={34}
                loading="lazy"
                decoding="async"
                className="h-[34px] w-[34px] rounded-full border border-border bg-background object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold leading-tight">{authorLabel}</div>
                <div className="mt-1 text-xs text-muted">{formatDate(item.pubDate)}</div>
              </div>
            </div>
            <span className="i-lucide-arrow-up-right h-4 w-4 flex-shrink-0 text-muted transition-colors group-hover:text-foreground" />
          </div>

          <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-foreground md:text-xl">
            {item.title}
          </h3>

          {item.summary && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
              {item.summary}
            </p>
          )}

          {item.archs?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.archs.map(arch => (
                <span
                  key={arch}
                  className="border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted"
                >
                  {arch}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {item.cover && (
          <div className="relative h-36 overflow-hidden border border-border bg-card md:h-full md:min-h-[150px]">
            {/* RSS item covers come from arbitrary hosts that cannot be safely whitelisted. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.cover}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
            />
          </div>
        )}
      </article>
    </a>
  )
}

export default function FriendsClient({ initialData }: FriendsClientProps) {
  const [data, setData] = useState<FriendsResponse | null>(initialData ?? null)
  const [query, setQuery] = useState('')
  const [author, setAuthor] = useState(ALL_AUTHORS)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT)
  const dataRef = useRef<FriendsResponse | null>(initialData ?? null)

  const loadFriends = useCallback(async () => {
    const hasData = Boolean(dataRef.current)

    setError(null)
    if (hasData) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch('/api/friends', {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const nextData = (await response.json()) as FriendsResponse
      setData(nextData)
      dataRef.current = nextData
    } catch {
      setError(hasData ? '刷新朋友动态失败，正在显示上一份内容。' : '朋友动态暂时加载失败，请稍后再试。')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!initialData) {
      void loadFriends()
    }
  }, [initialData, loadFriends])

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const sources = useMemo(() => data?.sources ?? [], [data?.sources])

  const authors = useMemo(() => {
    return Array.from(new Set(items.map(getAuthorLabel))).sort((a, b) => a.localeCompare(b))
  }, [items])

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return items.filter((item) => {
      const matchesAuthor = author === ALL_AUTHORS || getAuthorLabel(item) === author
      const matchesQuery = !keyword || [item.title, item.summary, item.author, item.sitenick]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(keyword))

      return matchesAuthor && matchesQuery
    })
  }, [author, items, query])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT)
  }, [author, data?.generatedAt, query])

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount)
  }, [filteredItems, visibleCount])

  const hasMore = visibleCount < filteredItems.length

  const loadMore = useCallback(() => {
    setVisibleCount(count => Math.min(count + VISIBLE_INCREMENT, filteredItems.length))
  }, [filteredItems.length])

  const okSources = sources.filter(source => source.ok).length
  const failedSources = sources.length - okSources
  const isInitialLoading = isLoading && !data

  return (
    <div className="mx-4 my-8 space-y-6 md:mx-8">
      {isInitialLoading ? (
        <ToolbarSkeleton />
      ) : (
        <section className="border-y border-border py-4">
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <MetaPill>{items.length} articles</MetaPill>
            <MetaPill>{okSources}/{sources.length} sources</MetaPill>
            <MetaPill>updated {data ? formatDate(data.generatedAt) : '--'}</MetaPill>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_42px]">
            <label className="flex h-10 items-center gap-2 border border-border bg-card px-3">
              <span className="i-lucide-search text-sm text-muted" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search friends posts"
                disabled={isInitialLoading}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex h-10 items-center gap-2 border border-border bg-card px-3">
              <span className="i-lucide-user-round text-sm text-muted" />
              <select
                value={author}
                onChange={event => setAuthor(event.target.value)}
                disabled={isInitialLoading || authors.length === 0}
                className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed"
              >
                <option value={ALL_AUTHORS}>All authors</option>
                {authors.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={loadFriends}
              disabled={isLoading || isRefreshing}
              className="flex h-10 items-center justify-center border border-border bg-card text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh friends feed"
              title="Refresh"
            >
              <span className={`i-lucide-refresh-cw text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </section>
      )}

      {failedSources > 0 && (
        <section className="border-l border-border pl-4 text-xs leading-relaxed text-muted">
          {failedSources} 个来源暂时不可用，页面已显示成功拉取的文章。
        </section>
      )}

      {error && (
        <section className="border-l border-border pl-4 text-xs leading-relaxed text-muted">
          {error}
        </section>
      )}

      {isInitialLoading ? (
        <section className="space-y-5">
          <ArticleSkeleton />
          <ArticleSkeleton />
          <ArticleSkeleton />
        </section>
      ) : filteredItems.length > 0 ? (
        <>
          <section className="space-y-5">
            {visibleItems.map(item => (
              <FriendArticleCard
                key={`${item.author}-${item.link}`}
                item={item}
              />
            ))}
          </section>

          {hasMore && (
            <div className="py-4">
              <button
                type="button"
                onClick={loadMore}
                className="flex h-10 w-full items-center justify-center gap-2 border border-border bg-card text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:border-primary hover:text-foreground"
              >
                <span className="i-lucide-plus h-3.5 w-3.5" />
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <section className="border border-border bg-card p-8 text-center text-sm text-muted">
          没有匹配的朋友动态。
        </section>
      )}
    </div>
  )
}
