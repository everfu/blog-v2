'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { PublicComment } from '@/features/comments'

interface CommentProps {
  path?: string
  postId?: string
  title?: string
  className?: string
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface CommentFormState {
  authorName: string
  email: string
  website: string
  body: string
}

const emptyForm: CommentFormState = {
  authorName: '',
  email: '',
  website: '',
  body: '',
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function CommentItem({
  comment,
  replies,
  onReply,
}: {
  comment: PublicComment
  replies: PublicComment[]
  onReply: (comment: PublicComment) => void
}) {
  const initial = comment.authorName.slice(0, 1).toUpperCase()

  return (
    <article className="border-t border-border py-5">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {comment.website ? (
              <a
                href={comment.website}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-foreground hover:opacity-70"
              >
                {comment.authorName}
              </a>
            ) : (
              <span className="text-sm font-medium text-foreground">{comment.authorName}</span>
            )}
            <time className="text-xs text-muted">{formatCommentDate(comment.createdAt)}</time>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {comment.body}
          </p>
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <span className="i-lucide-reply text-xs" />
            回复
          </button>

          {replies.length > 0 && (
            <div className="mt-4 border-l border-border pl-4">
              {replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} replies={[]} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Comment({
  path,
  postId,
  title = 'Comments',
  className = '',
}: CommentProps) {
  const pathname = usePathname()
  const pagePath = path || pathname || '/'
  const [comments, setComments] = useState<PublicComment[]>([])
  const [replyTo, setReplyTo] = useState<PublicComment | null>(null)
  const [form, setForm] = useState<CommentFormState>(emptyForm)
  const [status, setStatus] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const rootComments = useMemo(
    () => comments.filter(comment => !comment.parentId),
    [comments]
  )
  const repliesByParent = useMemo(() => {
    return comments.reduce<Record<string, PublicComment[]>>((groups, comment) => {
      if (!comment.parentId) return groups
      groups[comment.parentId] = groups[comment.parentId] || []
      groups[comment.parentId].push(comment)
      return groups
    }, {})
  }, [comments])

  useEffect(() => {
    let ignore = false

    setIsLoading(true)
    fetch(`/api/comments?path=${encodeURIComponent(pagePath)}`)
      .then(response => response.json())
      .then(data => {
        if (!ignore) setComments(Array.isArray(data.comments) ? data.comments : [])
      })
      .catch(() => {
        if (!ignore) setMessage('评论加载失败，请稍后刷新。')
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [pagePath])

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pagePath,
        postId,
        parentId: replyTo?.id,
        authorName: form.authorName,
        email: form.email,
        website: normalizeWebsite(form.website),
        body: form.body,
      }),
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      setStatus('error')
      setMessage(data.message || '评论提交失败。')
      return
    }

    setComments(current => [...current, data.comment])
    setForm(emptyForm)
    setReplyTo(null)
    setStatus('success')
    setMessage('评论已发布。')
  }

  return (
    <section className={`comment-section mx-4 my-8 md:mx-8 ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted">
          {title}
        </h2>
        <span className="text-xs text-muted">
          {isLoading ? 'Loading' : `${comments.length} 条`}
        </span>
      </div>

      <form onSubmit={submitComment} className="mb-7 space-y-3 border border-border bg-card p-4">
        {replyTo && (
          <div className="flex items-center justify-between gap-3 border-l border-border pl-3 text-xs text-muted">
            <span>回复 {replyTo.authorName}</span>
            <button type="button" onClick={() => setReplyTo(null)} className="hover:text-foreground">
              取消
            </button>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          <input
            required
            value={form.authorName}
            onChange={event => setForm(current => ({ ...current, authorName: event.target.value }))}
            placeholder="昵称"
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
          <input
            type="email"
            value={form.email}
            onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
            placeholder="邮箱（可选）"
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
          <input
            value={form.website}
            onChange={event => setForm(current => ({ ...current, website: event.target.value }))}
            placeholder="网址（可选）"
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
        <textarea
          required
          minLength={2}
          maxLength={2000}
          value={form.body}
          onChange={event => setForm(current => ({ ...current, body: event.target.value }))}
          placeholder="写点什么..."
          rows={4}
          className="w-full resize-y border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-muted'}`}>
            {message || '游客评论会直接显示，管理员可在后台处理。'}
          </p>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="i-lucide-send text-xs" />
            {status === 'submitting' ? '发送中' : '发送'}
          </button>
        </div>
      </form>

      <div>
        {rootComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={repliesByParent[comment.id] || []}
            onReply={setReplyTo}
          />
        ))}
        {!isLoading && comments.length === 0 && (
          <div className="border-t border-border py-8 text-center text-sm text-muted">
            还没有评论。
          </div>
        )}
      </div>
    </section>
  )
}
