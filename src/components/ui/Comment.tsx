'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import type { PublicComment } from '@/server/comments/contracts/types'
import { normalizeEmojiIconSource } from '@/server/comments/contracts/emoji'
import { cn } from '@/lib/utils'

interface CommentProps {
  path: string
  postId?: string
  className?: string
}

interface CommentFormState {
  authorName: string
  email: string
  website: string
  body: string
}

interface EmojiItem {
  text: string
  icon: string
}

interface EmojiCategory {
  type: 'image' | 'text' | 'emoji' | 'emoticon'
  container: EmojiItem[]
}

type EmojiPack = Record<string, EmojiCategory>

interface EmojiPickerCategory {
  name: string
  type: EmojiCategory['type']
  items: Array<EmojiItem & { key: string, shortcode: string }>
}

interface EmojiImageToken {
  name: string
  icon: string
  label: string
}

const emptyForm: CommentFormState = {
  authorName: '',
  email: '',
  website: '',
  body: '',
}

const defaultEmojiPacks: EmojiPack[] = [
  {
    默认: {
      type: 'emoji',
      container: [
        { text: '', icon: '🙂' },
        { text: '', icon: '✨' },
        { text: '', icon: '❤️' },
      ],
    },
  },
]

function createViewerToken() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

function getViewerToken() {
  const key = 'cube-comment-viewer-token'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const token = createViewerToken()
  window.localStorage.setItem(key, token)
  return token
}

function getStoredIdentity() {
  try {
    const raw = window.localStorage.getItem('cube-comment-identity')
    if (!raw) return emptyForm
    const parsed = JSON.parse(raw) as Partial<CommentFormState>
    return {
      authorName: parsed.authorName || '',
      email: parsed.email || '',
      website: parsed.website || '',
      body: '',
    }
  } catch {
    return emptyForm
  }
}

function storeIdentity(form: CommentFormState) {
  window.localStorage.setItem('cube-comment-identity', JSON.stringify({
    authorName: form.authorName,
    email: form.email,
    website: form.website,
  }))
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function normalizeEmojiShortcode(value: string, fallback: string) {
  const normalized = value
    .trim()
    .replace(/^::|::$/g, '')
    .replace(/\s+/g, '-')
    .replace(/:/g, '')

  return normalized || fallback
}

function getEmojiCategories(emojiPacks: EmojiPack[]): EmojiPickerCategory[] {
  return emojiPacks.flatMap(pack => Object.entries(pack).map(([name, category]) => ({
    name,
    type: category.type,
    items: category.container.map((item, index) => {
      const icon = normalizeEmojiIconSource(item.icon)

      return {
        ...item,
        icon,
        key: `${name}-${index}-${icon}`,
        shortcode: normalizeEmojiShortcode(item.text || '', `${name}-${index + 1}`),
      }
    }),
  })))
}

function getEmojiImageTokens(emojiPacks: EmojiPack[]) {
  const tokens = new Map<string, EmojiImageToken>()

  getEmojiCategories(emojiPacks)
    .filter(category => category.type === 'image')
    .forEach(category => {
      category.items.forEach(item => {
        tokens.set(item.shortcode, {
          name: item.shortcode,
          icon: item.icon,
          label: item.text || item.shortcode,
        })
      })
    })

  return tokens
}

function SkeletonLine({ className }: { className: string }) {
  return <span className={cn('block animate-pulse bg-border', className)} aria-hidden="true" />
}

function CommentListSkeleton() {
  return (
    <div className="border-b border-border" aria-label="评论加载中">
      {Array.from({ length: 2 }).map((_, index) => (
        <article key={index} className="flex gap-3 border-t border-border py-5">
          <SkeletonLine className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-3 w-32" />
            </div>
            <div className="mt-4 grid gap-2">
              <SkeletonLine className="h-3 w-full max-w-[92%]" />
              <SkeletonLine className="h-3 w-full max-w-[68%]" />
            </div>
            <div className="mt-4 flex gap-3">
              <SkeletonLine className="h-3 w-10" />
              <SkeletonLine className="h-3 w-12" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function CommentAvatar({ comment }: { comment: PublicComment }) {
  if (comment.authorAvatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={comment.authorAvatarUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full border border-border bg-card object-cover"
      />
    )
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-muted">
      {comment.authorName.slice(0, 1).toUpperCase()}
    </div>
  )
}

function getOsIcon(value: string) {
  if (/mac|ios/i.test(value)) return 'i-ri-apple-fill'
  if (/windows/i.test(value)) return 'i-ri-microsoft-fill'
  if (/android/i.test(value)) return 'i-ri-android-fill'
  if (/linux/i.test(value)) return 'i-mdi-linux'
  return 'i-lucide-monitor'
}

function getBrowserIcon(value: string) {
  if (/edge/i.test(value)) return 'i-ri-edge-fill'
  if (/chrome/i.test(value)) return 'i-ri-chrome-fill'
  if (/safari/i.test(value)) return 'i-ri-safari-fill'
  if (/firefox/i.test(value)) return 'i-ri-firefox-fill'
  if (/opera/i.test(value)) return 'i-simple-icons-opera'
  return 'i-lucide-globe'
}

function CommentMetaLine({ comment }: { comment: PublicComment }) {
  const date = new Date(comment.createdAt).toLocaleString('zh-CN')
  const [os, browser] = (comment.uaSummary || '').split(' · ').map(part => part.trim())
  const items = [
    { key: 'time', icon: 'i-lucide-clock-3', value: date },
    comment.locationLabel ? { key: 'location', icon: 'i-lucide-map-pin', value: comment.locationLabel } : null,
    os ? { key: 'os', icon: getOsIcon(os), value: os } : null,
    browser ? { key: 'browser', icon: getBrowserIcon(browser), value: browser } : null,
  ].filter(Boolean) as Array<{ key: string, icon: string, value: string }>

  return (
    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-5 text-muted">
      {items.map(item => (
        <span key={item.key} className="inline-flex min-w-0 max-w-full items-center gap-1">
          <span className={cn(item.icon, 'shrink-0 text-[12px] opacity-70')} aria-hidden="true" />
          <span className="min-w-0 truncate">{item.value}</span>
        </span>
      ))}
    </div>
  )
}

function escapeMarkdownImageAlt(value: string) {
  return value.replace(/[[\]\\]/g, '\\$&')
}

function renderEmojiShortcodes(body: string, emojiImages?: Map<string, EmojiImageToken>) {
  if (!emojiImages?.size) return body

  return body.replace(/::([^:\n]{1,80})::/g, (match, shortcode: string) => {
    const token = emojiImages.get(shortcode)
    if (!token) return match

    return `![${escapeMarkdownImageAlt(token.label)}](<${token.icon}>)`
  })
}

function MarkdownBody({ body, emojiImages }: { body: string, emojiImages?: Map<string, EmojiImageToken> }) {
  const renderedBody = useMemo(() => renderEmojiShortcodes(body, emojiImages), [body, emojiImages])

  return (
    <div className="comment-markdown max-w-none text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              {children}
            </a>
          ),
          p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
          code: ({ children }) => (
            <code className="bg-card px-1 py-0.5 text-[0.85em]">
              {children}
            </code>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src || ''}
              alt={alt || ''}
              title={alt || ''}
              className="inline-block h-5 w-5 align-[-0.2em] object-contain"
            />
          ),
        }}
      >
        {renderedBody}
      </ReactMarkdown>
    </div>
  )
}

function EmojiPicker({
  emojiPacks,
  onSelect,
}: {
  emojiPacks: EmojiPack[]
  onSelect: (icon: string) => void
}) {
  const categories = useMemo(() => getEmojiCategories(emojiPacks), [emojiPacks])
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategoryName, setActiveCategoryName] = useState('')
  const pickerRef = useRef<HTMLDivElement | null>(null)

  const activeCategory = useMemo(() => {
    if (categories.length === 0) return null
    return categories.find(category => category.name === activeCategoryName) || categories[0]
  }, [activeCategoryName, categories])

  useEffect(() => {
    if (!activeCategoryName && categories[0]) {
      setActiveCategoryName(categories[0].name)
    }
  }, [activeCategoryName, categories])

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (categories.length === 0 || !activeCategory) return null

  const isImageCategory = activeCategory.type === 'image'
  const isWideTextCategory = activeCategory.type === 'text' || activeCategory.type === 'emoticon'

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-label="选择表情"
        aria-expanded={isOpen}
        className="inline-flex h-10 w-10 items-center justify-center border border-border bg-background text-muted transition-colors hover:border-foreground hover:text-foreground"
      >
        <span className="i-lucide-smile text-xl" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-[min(760px,calc(100vw-2rem))] overflow-hidden border border-border bg-background text-foreground shadow-lg">
          <div
            className={cn(
              'grid max-h-72 gap-x-3 gap-y-2 overflow-y-auto p-4',
              isImageCategory
                ? 'grid-cols-[repeat(auto-fill,minmax(44px,1fr))]'
                : isWideTextCategory
                  ? 'grid-cols-[repeat(auto-fill,minmax(112px,1fr))]'
                  : 'grid-cols-[repeat(auto-fill,minmax(48px,1fr))]'
            )}
          >
            {activeCategory.items.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(isImageCategory ? `::${item.shortcode}::` : item.icon)
                  setIsOpen(false)
                }}
                title={item.text || item.icon}
                className={cn(
                  'flex h-10 min-w-0 items-center justify-center px-2 text-center transition-colors hover:bg-card focus-visible:bg-card focus-visible:outline-none',
                  isImageCategory ? 'h-12' : isWideTextCategory ? 'text-lg leading-none' : 'text-xl'
                )}
              >
                {isImageCategory ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.icon} alt={item.text || ''} className="h-8 w-8 object-contain" />
                ) : (
                  <span className="truncate">{item.icon}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 overflow-x-auto border-t border-border bg-card/60">
            {categories.map(category => {
              const active = category.name === activeCategory.name

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setActiveCategoryName(category.name)}
                  data-active={active}
                  className="h-11 shrink-0 px-5 text-sm font-semibold text-muted transition-colors hover:bg-background hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground"
                >
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function CommentForm({
  form,
  emojiPacks,
  isSubmitting,
  onChange,
  onSubmit,
  onCancelReply,
  textareaRef,
  replyTo,
  className = '',
}: {
  form: CommentFormState
  emojiPacks: EmojiPack[]
  isSubmitting: boolean
  replyTo: PublicComment | null
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onChange: (patch: Partial<CommentFormState>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancelReply: () => void
  className?: string
}) {
  function insertEmoji(icon: string) {
    const target = textareaRef.current
    if (!target) {
      onChange({ body: `${form.body}${icon}` })
      return
    }

    const start = target.selectionStart
    const end = target.selectionEnd
    const next = `${form.body.slice(0, start)}${icon}${form.body.slice(end)}`
    onChange({ body: next })
    requestAnimationFrame(() => {
      target.focus()
      target.setSelectionRange(start + icon.length, start + icon.length)
    })
  }

  return (
    <form onSubmit={onSubmit} className={cn('grid gap-3 py-4', className)}>
      {replyTo && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-l border-border pl-3 text-xs text-muted">
          <span>回复 {replyTo.authorName}</span>
          <button type="button" onClick={onCancelReply} className="hover:text-foreground">
            取消回复
          </button>
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-3">
        <input
          value={form.authorName}
          onChange={event => onChange({ authorName: event.target.value })}
          required
          maxLength={40}
          placeholder="昵称"
          className="h-10 border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-foreground"
        />
        <input
          value={form.email}
          onChange={event => onChange({ email: event.target.value })}
          required
          type="email"
          maxLength={160}
          placeholder="邮箱"
          className="h-10 border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-foreground"
        />
        <input
          value={form.website}
          onChange={event => onChange({ website: event.target.value })}
          required
          maxLength={240}
          placeholder="网站地址"
          className="h-10 border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-foreground"
        />
      </div>

      <textarea
        ref={textareaRef}
        value={form.body}
        onChange={event => onChange({ body: event.target.value })}
        required
        minLength={2}
        maxLength={2000}
        placeholder="写下评论..."
        className="min-h-28 resize-y border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted focus:border-foreground"
      />

      <div className="flex items-end justify-between gap-3">
        <EmojiPicker emojiPacks={emojiPacks} onSelect={insertEmoji} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center gap-2 bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="i-lucide-send text-sm" />
          {isSubmitting ? '提交中' : '发表评论'}
        </button>
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  replies,
  onReply,
  onLike,
  isLiked,
  emojiImages,
  activeReplyForm,
}: {
  comment: PublicComment
  replies: PublicComment[]
  isLiked: (comment: PublicComment) => boolean
  emojiImages: Map<string, EmojiImageToken>
  onReply: (comment: PublicComment) => void
  onLike: (comment: PublicComment) => void
  activeReplyForm?: (comment: PublicComment) => React.ReactNode
}) {
  const replyForm = activeReplyForm?.(comment)
  const liked = isLiked(comment)

  return (
    <article id={`comment-${comment.id}`} className="scroll-mt-24">
      <div className={cn('flex gap-3 border-t border-border py-5', comment.isOwnPending && 'bg-card/30 px-3')}>
        <CommentAvatar comment={comment} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {comment.website ? (
                  <a href={comment.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-foreground hover:underline">
                    {comment.authorName}
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
                )}
                {comment.isOwnPending && <span className="border border-amber-500/25 px-1.5 py-0.5 text-[11px] leading-none text-amber-600">待审核</span>}
              </div>
              <CommentMetaLine comment={comment} />
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
              <button
                type="button"
                onClick={() => onLike(comment)}
                disabled={liked || comment.status !== 'approved'}
                title="点赞"
                aria-label="点赞"
                className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className={liked ? 'i-lucide-heart text-red-500' : 'i-lucide-heart'} />
                {comment.likeCount}
              </button>
              {comment.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => onReply(comment)}
                  title="回复评论"
                  aria-label="回复评论"
                  className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 hover:bg-card hover:text-foreground"
                >
                  <span className="i-lucide-message-circle text-sm" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <MarkdownBody body={comment.body} emojiImages={emojiImages} />
          </div>
          {replyForm && <div className="mt-4">{replyForm}</div>}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-5 border-l border-border pl-4">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              isLiked={isLiked}
              emojiImages={emojiImages}
              onReply={onReply}
              onLike={onLike}
              activeReplyForm={activeReplyForm}
            />
          ))}
        </div>
      )}
    </article>
  )
}

export default function Comment({ path, postId, className }: CommentProps) {
  const [comments, setComments] = useState<PublicComment[]>([])
  const [emojiPacks, setEmojiPacks] = useState<EmojiPack[]>(defaultEmojiPacks)
  const [form, setForm] = useState<CommentFormState>(emptyForm)
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
