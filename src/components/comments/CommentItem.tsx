import { cn } from '@/lib/utils'
import { MarkdownBody } from './MarkdownBody'
import type { CommentItemProps } from './types'
import type { PublicComment } from '@/server/comments/contracts/types'

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

export function CommentItem({
  comment,
  replies,
  onReply,
  onLike,
  isLiked,
  emojiImages,
  activeReplyForm,
}: CommentItemProps) {
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
