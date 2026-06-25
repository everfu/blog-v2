'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const EMOJIS = [
  { emoji: '👍', label: '赞' },
  { emoji: '❤️', label: '爱' },
  { emoji: '😂', label: '笑哭' },
  { emoji: '👏', label: '鼓掌' },
  { emoji: '🤔', label: '思考' },
] as const

type Emoji = (typeof EMOJIS)[number]['emoji']

export interface PostReactionsProps {
  postId: string
  initialReactions: Record<string, number>
}

function storageKey(postId: string, emoji: string) {
  return `post-reaction:${postId}:${emoji}`
}

export default function PostReactions({ postId, initialReactions }: PostReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialReactions)
  const [reacted, setReacted] = useState<Set<string>>(new Set())
  const [pending, setPending] = useState<string | null>(null)

  // 客户端从 localStorage 恢复已反应的 emoji（避免 hydration mismatch：服务端初始 reacted=空）
  useEffect(() => {
    const restored = new Set<string>()
    for (const e of EMOJIS) {
      if (window.localStorage.getItem(storageKey(postId, e.emoji)) === '1') {
        restored.add(e.emoji)
      }
    }
    if (restored.size > 0) {
      setReacted(restored)
    }
  }, [postId])

  const handle = useCallback(
    async (emoji: Emoji) => {
      if (reacted.has(emoji) || pending) return
      setPending(emoji)
      // 乐观更新
      setCounts(c => ({ ...c, [emoji]: (c[emoji] ?? 0) + 1 }))
      setReacted(s => {
        const next = new Set(s)
        next.add(emoji)
        return next
      })
      try {
        const res = await fetch(
          `/api/posts/${postId}/react?emoji=${encodeURIComponent(emoji)}`,
          { method: 'POST' },
        )
        if (!res.ok) throw new Error('reaction failed')
        const data = await res.json().catch(() => null)
        if (data && typeof data === 'object' && data.reactions && typeof data.reactions === 'object') {
          setCounts(data.reactions as Record<string, number>)
        }
        window.localStorage.setItem(storageKey(postId, emoji), '1')
      } catch {
        // 回滚乐观更新
        setCounts(c => ({ ...c, [emoji]: Math.max(0, (c[emoji] ?? 1) - 1) }))
        setReacted(s => {
          const next = new Set(s)
          next.delete(emoji)
          return next
        })
      } finally {
        setPending(null)
      }
    },
    [postId, reacted, pending],
  )

  return (
    <div className="post-reactions" aria-label="文章互动">
      {EMOJIS.map(({ emoji, label }) => {
        const count = counts[emoji] ?? 0
        const isReacted = reacted.has(emoji)
        return (
          <button
            key={emoji}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => handle(emoji)}
            disabled={isReacted || pending === emoji}
            className={cn(
              'post-reaction-button group',
              'disabled:cursor-default',
              pending === emoji && 'is-pending',
              isReacted && 'is-reacted',
            )}
          >
            <span
              className={cn(
                'post-reaction-emoji',
                isReacted && 'is-reacted',
              )}
              aria-hidden
            >
              {emoji}
            </span>
            <span className="post-reaction-count">
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
