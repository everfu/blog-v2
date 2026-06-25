'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PublicComment } from '@/server/comments/contracts/types'
import { cn } from '@/lib/utils'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import { CommentListSkeleton } from './CommentListSkeleton'
import { defaultEmojiPacks, emptyCommentForm } from './constants'
import { getEmojiImageTokens } from './emoji'
import { getStoredIdentity, getViewerToken, storeIdentity } from './storage'
import { SkeletonLine } from './SkeletonLine'
import { normalizeWebsite } from './utils'
import type { CommentFormState, CommentProps, EmojiPack } from './types'

export default function Comment({ path, postId, className }: CommentProps) {
  const [comments, setComments] = useState<PublicComment[]>([])
  const [emojiPacks, setEmojiPacks] = useState<EmojiPack[]>(defaultEmojiPacks)
  const [form, setForm] = useState<CommentFormState>(emptyCommentForm)
  const [viewerToken, setViewerToken] = useState('')
  const [replyTo, setReplyTo] = useState<PublicComment | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const repliesByParent = useMemo(() => comments.reduce<Record<string, PublicComment[]>>((groups, comment) => {
    if (!comment.parentId) return groups
    groups[comment.parentId] = groups[comment.parentId] || []
    groups[comment.parentId].push(comment)
    return groups
  }, {}), [comments])
  const rootComments = useMemo(() => comments.filter(comment => !comment.parentId), [comments])
  const emojiImages = useMemo(() => getEmojiImageTokens(emojiPacks), [emojiPacks])

  useEffect(() => {
    const token = getViewerToken()
    setViewerToken(token)
    setForm(getStoredIdentity())
  }, [])

  const loadComments = useCallback(async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments?path=${encodeURIComponent(path)}`, {
        headers: { 'x-comment-viewer-token': token },
      })
      const data = await response.json()
      setComments(Array.isArray(data.comments) ? data.comments : [])
      setEmojiPacks(data.settings?.emojiPacks || defaultEmojiPacks)
    } catch {
      setMessage('评论加载失败，请稍后刷新。')
    } finally {
      setIsLoading(false)
    }
  }, [path])

  useEffect(() => {
    if (viewerToken) void loadComments(viewerToken)
  }, [loadComments, viewerToken])

  function patchForm(patch: Partial<CommentFormState>) {
    setForm(current => ({ ...current, ...patch }))
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    const website = normalizeWebsite(form.website)
    try {
      new URL(website)
    } catch {
      setMessage('网站地址格式不正确。')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          pagePath: path,
          postId: postId || null,
          parentId: replyTo?.id || null,
          authorName: form.authorName,
          email: form.email,
          website,
          body: form.body,
          viewerToken,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.message || '评论提交失败。')
        return
      }

      storeIdentity({ ...form, website })
      setForm(current => ({ ...current, website, body: '' }))
      setReplyTo(null)
      setMessage(data.status === 'pending' ? '评论已提交，审核通过后会公开显示。' : '评论已发布。')
      if (data.comment) {
        setComments(current => [data.comment as PublicComment, ...current])
      }
    } catch {
      setMessage('评论提交失败，请稍后再试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function likeComment(comment: PublicComment) {
    if (likedCommentIds.has(comment.id) || comment.status !== 'approved') return
    setLikedCommentIds(current => new Set(current).add(comment.id))
    setComments(current => current.map(item => item.id === comment.id ? { ...item, likeCount: item.likeCount + 1 } : item))

    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'like failed')
      setComments(current => current.map(item => item.id === comment.id ? { ...item, likeCount: data.likeCount ?? item.likeCount } : item))
    } catch {
      setLikedCommentIds(current => {
        const next = new Set(current)
        next.delete(comment.id)
        return next
      })
      setComments(current => current.map(item => item.id === comment.id ? { ...item, likeCount: Math.max(0, item.likeCount - 1) } : item))
      setMessage('点赞失败，请稍后再试。')
    }
  }

  function startReply(comment: PublicComment) {
    setReplyTo(comment)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  return (
    <section className={cn('comment-section mx-4 my-8 pt-4 md:mx-8', className)}>
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted">Comments</h2>
          {isLoading ? (
            <SkeletonLine className="h-3 w-12" />
          ) : (
            <span className="text-xs text-muted">{comments.length} 条</span>
          )}
        </div>

        {!replyTo && (
          <CommentForm
            form={form}
            emojiPacks={emojiPacks}
            isSubmitting={isSubmitting}
            replyTo={null}
            textareaRef={textareaRef}
            onChange={patchForm}
            onSubmit={submitComment}
            onCancelReply={() => setReplyTo(null)}
          />
        )}

        {message && (
          <div className="border-l border-border bg-card/35 px-3 py-2 text-sm text-muted">
            {message}
          </div>
        )}

        <div>
          {isLoading ? (
            <CommentListSkeleton />
          ) : (
            <>
              {rootComments.length > 0 && (
                <div>
                  {rootComments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      replies={repliesByParent[comment.id] || []}
                      isLiked={item => likedCommentIds.has(item.id)}
                      emojiImages={emojiImages}
                      onReply={startReply}
                      onLike={likeComment}
                      activeReplyForm={activeComment => activeComment.id === replyTo?.id ? (
                        <CommentForm
                          form={form}
                          emojiPacks={emojiPacks}
                          isSubmitting={isSubmitting}
                          replyTo={replyTo}
                          textareaRef={textareaRef}
                          onChange={patchForm}
                          onSubmit={submitComment}
                          onCancelReply={() => setReplyTo(null)}
                          className="border-l border-border py-0 pl-3"
                        />
                      ) : null}
                    />
                  ))}
                </div>
              )}
              {comments.length === 0 && (
                <div className="border-y border-border py-8 text-center text-sm text-muted">
                  <span className="i-lucide-message-circle-more mr-2 align-[-0.15em]" />
                  还没有评论。
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
