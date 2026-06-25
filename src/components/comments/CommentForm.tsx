import { cn } from '@/lib/utils'
import { EmojiPicker } from './EmojiPicker'
import type { CommentFormProps } from './types'

export function CommentForm({
  form,
  emojiPacks,
  isSubmitting,
  onChange,
  onSubmit,
  onCancelReply,
  textareaRef,
  replyTo,
  className = '',
}: CommentFormProps) {
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
