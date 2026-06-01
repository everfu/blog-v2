'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { FriendItem, FriendsResponse } from '@/types/feed'
import { formatDate } from '@/lib/utils'

interface FriendsClientProps {
  initialData: FriendsResponse
}

const ALL_AUTHORS = 'ALL'

function getAuthorLabel(item: Pick<FriendItem, 'author' | 'sitenick'>) {
  return item.sitenick || item.author
}

export default function FriendsClient({ initialData }: FriendsClientProps) {
  const [data, setData] = useState(initialData)
  const [query, setQuery] = useState('')
  const [author, setAuthor] = useState(ALL_AUTHORS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    let ignore = false

    async function refresh() {
      setIsRefreshing(true)
      try {
        const response = await fetch('/api/friends')
        if (!response.ok) return
        const nextData = (await response.json()) as FriendsResponse
        if (!ignore) setData(nextData)
      } finally {
        if (!ignore) setIsRefreshing(false)
      }
    }

    refresh()

    return () => {
      ignore = true
    }
  }, [])

  const authors = useMemo(() => {
    return Array.from(new Set(data.items.map(getAuthorLabel))).sort((a, b) => a.localeCompare(b))
  }, [data.items])

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return data.items.filter((item) => {
      const matchesAuthor = author === ALL_AUTHORS || getAuthorLabel(item) === author
      const matchesQuery = !keyword || [item.title, item.summary, item.author, item.sitenick]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(keyword))

      return matchesAuthor && matchesQuery
    })
  }, [author, data.items, query])

  const okSources = data.sources.filter(source => source.ok).length
  const failedSources = data.sources.length - okSources

  return (
    <div className="mx-4 md:mx-8 my-8 space-y-6">
      <section className="grid grid-cols-3 border border-border bg-card">
        <div className="p-4 border-r border-border">
          <div className="text-xs text-muted">Articles</div>
          <div className="text-xl font-semibold leading-tight">{data.items.length}</div>
        </div>
        <div className="p-4 border-r border-border">
          <div className="text-xs text-muted">Sources</div>
          <div className="text-xl font-semibold leading-tight">{okSources}/{data.sources.length}</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-muted">Updated</div>
          <div className="text-sm font-medium leading-tight">{formatDate(data.generatedAt)}</div>
        </div>
      </section>

      <section className="flex flex-col gap-3 md:flex-row">
        <label className="flex-1 border border-border bg-card px-3 py-2 flex items-center gap-2">
          <span className="i-lucide-search text-sm text-muted" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search friends posts"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>

        <label className="border border-border bg-card px-3 py-2 flex items-center gap-2 md:w-56">
          <span className="i-lucide-user-round text-sm text-muted" />
          <select
            value={author}
            onChange={event => setAuthor(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          >
            <option value={ALL_AUTHORS}>All authors</option>
            {authors.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
      </section>

      {failedSources > 0 && (
        <section className="border border-border bg-card p-4 text-xs text-muted">
          {failedSources} 个来源暂时不可用，页面已显示成功拉取的文章。
        </section>
      )}

      {isRefreshing && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-3 h-3 border border-muted border-t-foreground rounded-full animate-spin" />
          Refreshing feeds
        </div>
      )}

      {filteredItems.length > 0 ? (
        <section className="space-y-4">
          {filteredItems.map(item => (
            <a
              key={`${item.author}-${item.link}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border bg-card hover:border-primary transition-colors"
            >
              <article className="grid md:grid-cols-[1fr_180px] min-h-[150px]">
                <div className="p-4 md:p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.avatar}
                      alt={getAuthorLabel(item)}
                      width={32}
                      height={32}
                      className="rounded-full border border-border bg-background object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{getAuthorLabel(item)}</div>
                      <div className="text-xs text-muted">{formatDate(item.pubDate)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-semibold leading-snug">{item.title}</h3>
                    {item.summary && (
                      <p className="text-sm text-muted leading-relaxed line-clamp-3">{item.summary}</p>
                    )}
                  </div>

                  {item.archs?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {item.archs.map(arch => (
                        <span key={arch} className="border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                          {arch}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {item.cover ? (
                  <div className="relative hidden md:block border-l border-border bg-background">
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="hidden md:flex border-l border-border bg-background items-center justify-center">
                    <span className="i-lucide-rss text-2xl text-muted" />
                  </div>
                )}
              </article>
            </a>
          ))}
        </section>
      ) : (
        <section className="border border-border bg-card p-8 text-center text-sm text-muted">
          没有匹配的朋友动态。
        </section>
      )}
    </div>
  )
}
