'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

interface PostMetricsProps {
  postId: string
  initialViewCount: number
  initialLikeCount: number
  initialCommentCount?: number
  readonlyMetric?: 'like' | 'comment'
  variant?: 'compact' | 'footer'
  readonly?: boolean
}

type LikeState = 'idle' | 'saving' | 'liked' | 'error'

const viewReportWindowMs = 2000
const recentViewReports = new Map<string, number>()
const metricsSyncEventName = 'post-metrics-sync'
const metaItemClass = 'inline-flex items-center gap-1'
const metaBadgeClass = 'inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-xs'
const metaIconClass = 'text-[10px]'

interface PostMetricsSyncDetail {
  postId: string
  viewCount?: number
  likeCount?: number
  liked?: boolean
}

export default function PostMetrics({
  postId,
  initialViewCount,
  initialLikeCount,
  initialCommentCount = 0,
  readonlyMetric = 'like',
  variant = 'compact',
  readonly = false,
}: PostMetricsProps) {
  const storageKey = useMemo(() => `post-liked:${postId}`, [postId])
  const [viewCount, setViewCount] = useState(initialViewCount)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [state, setState] = useState<LikeState>('idle')

  useEffect(() => {
    if (window.localStorage.getItem(storageKey) === '1') {
      setState('liked')
    }
  }, [storageKey])

  useEffect(() => {
    function syncMetrics(event: Event) {
      const { detail } = event as CustomEvent<PostMetricsSyncDetail>

      if (!detail || detail.postId !== postId) return

      if (typeof detail.viewCount === 'number') setViewCount(detail.viewCount)
      if (typeof detail.likeCount === 'number') setLikeCount(detail.likeCount)
      if (detail.liked) setState('liked')
    }

    window.addEventListener(metricsSyncEventName, syncMetrics)

    return () => {
      window.removeEventListener(metricsSyncEventName, syncMetrics)
    }
  }, [postId])

  const broadcastMetrics = useCallback((detail: Omit<PostMetricsSyncDetail, 'postId'>) => {
    window.dispatchEvent(new CustomEvent<PostMetricsSyncDetail>(metricsSyncEventName, {
      detail: { postId, ...detail },
    }))
  }, [postId])

  useEffect(() => {
    let ignore = false
    const now = Date.now()
    const lastReportedAt = recentViewReports.get(postId)

    if (lastReportedAt && now - lastReportedAt < viewReportWindowMs) {
      return
    }

    recentViewReports.set(postId, now)

    fetch(`/api/posts/${postId}/view`, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        if (!ignore && typeof data.viewCount === 'number') {
          setViewCount(data.viewCount)
          if (typeof data.likeCount === 'number') setLikeCount(data.likeCount)
          broadcastMetrics({
            viewCount: data.viewCount,
            likeCount: data.likeCount,
          })
        }
      })
      .catch(() => {
        recentViewReports.delete(postId)
        // Keep server-rendered counts when metrics are unavailable.
      })

    return () => {
      ignore = true
    }
  }, [broadcastMetrics, postId])

  async function likePost() {
    if (state === 'saving' || state === 'liked') return

    setState('saving')

    const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      setState('error')
      return
    }

    if (typeof data.likeCount === 'number') setLikeCount(data.likeCount)
    if (typeof data.viewCount === 'number') setViewCount(data.viewCount)

    window.localStorage.setItem(storageKey, '1')
    setState('liked')
    broadcastMetrics({
      liked: true,
      viewCount: data.viewCount,
      likeCount: data.likeCount,
    })
  }

  if (variant === 'footer') {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-muted">
        <button
          type="button"
          aria-label="点赞这篇文章"
          onClick={likePost}
          disabled={state === 'saving' || state === 'liked'}
          className="group inline-flex h-10 min-w-16 items-center justify-center gap-2 text-base font-medium text-foreground transition-opacity hover:opacity-70 disabled:cursor-default disabled:opacity-100"
          aria-pressed={state === 'liked'}
        >
          <span className={`${state === 'liked' ? 'i-lucide-heart text-red-500' : 'i-lucide-heart'} text-2xl transition-transform group-hover:scale-105`} />
          {likeCount}
        </button>
        {state === 'error' && <span className="text-xs text-red-400">点赞失败</span>}
      </div>
    )
  }

  if (readonly) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className={metaBadgeClass}>
          <span className={`i-lucide-eye ${metaIconClass}`} />
          {viewCount}
        </span>
        <span className={metaBadgeClass}>
          {readonlyMetric === 'comment' ? (
            <>
              <span className={`i-lucide-message-circle ${metaIconClass}`} />
              {initialCommentCount}
            </>
          ) : (
            <>
              <span className={`${state === 'liked' ? 'i-lucide-heart text-red-500' : 'i-lucide-heart'} ${metaIconClass}`} />
              {likeCount}
            </>
          )}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
      <span className={metaItemClass}>
        <span className={`i-lucide-eye ${metaIconClass}`} />
        {viewCount}
      </span>
      <button
        type="button"
        onClick={likePost}
        disabled={state === 'saving' || state === 'liked'}
        className="inline-flex items-center gap-1 text-muted transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-80"
        aria-pressed={state === 'liked'}
      >
        <span className={`${state === 'liked' ? 'i-lucide-heart text-red-500' : 'i-lucide-heart'} ${metaIconClass}`} />
        {likeCount}
      </button>
      {state === 'error' && (
        <span className="text-red-400">点赞失败</span>
      )}
    </div>
  )
}
