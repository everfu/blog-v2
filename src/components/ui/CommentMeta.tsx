import type { AdminComment, PublicComment } from '@/server/comments/contracts/types'

type CommentMetaTone = 'muted' | 'success' | 'warning'
type CommentMetaSurface = 'admin' | 'public'

export interface CommentMetaItem {
  key: string
  icon: string
  label?: string
  value: string
  tone?: CommentMetaTone
  title?: string
}

interface CommentMetaOptions {
  surface: CommentMetaSurface
  formattedDate?: string
}

const toneClass: Record<CommentMetaTone, string> = {
  muted: 'border-border bg-card/30 text-muted',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

function getOsIcon(value: string) {
  if (/mac|ios|sequoia|sonoma|ventura|monterey|sur|catalina|mojave|sierra|tahoe/i.test(value)) return 'i-ri-apple-fill'
  if (/windows/i.test(value)) return 'i-ri-microsoft-fill'
  if (/linux/i.test(value)) return 'i-mdi-linux'
  if (/android/i.test(value)) return 'i-ri-android-fill'
  return 'i-lucide-monitor'
}

function getBrowserIcon(value: string) {
  if (/chrome/i.test(value)) return 'i-ri-chrome-fill'
  if (/edge/i.test(value)) return 'i-ri-edge-fill'
  if (/safari/i.test(value)) return 'i-ri-safari-fill'
  if (/firefox/i.test(value)) return 'i-ri-firefox-fill'
  if (/opera/i.test(value)) return 'i-simple-icons-opera'
  return 'i-lucide-globe'
}

function getUaParts(summary: string | null) {
  const [os, browser] = (summary || '').split(' · ').map(part => part.trim())

  return {
    os: os || '未知系统',
    browser: browser || '未知浏览器',
  }
}

export function getCommentMetaItems(
  comment: PublicComment | AdminComment,
  options: CommentMetaOptions
): CommentMetaItem[] {
  const ua = getUaParts(comment.uaSummary)
  const items: CommentMetaItem[] = []

  if (options.surface === 'admin') {
    items.push(
      {
        key: 'path',
        icon: 'i-lucide-route',
        label: '页面',
        value: comment.pagePath,
        title: comment.pagePath,
      },
      {
        key: 'time',
        icon: 'i-lucide-clock-3',
        label: '时间',
        value: options.formattedDate || comment.createdAt,
      },
      {
        key: 'website',
        icon: 'i-lucide-link',
        label: '网站',
        value: comment.website ? '已填写网站' : '未填写网站',
        tone: comment.website ? 'success' : 'muted',
        title: comment.website || undefined,
      },
      {
        key: 'email',
        icon: comment.emailHash ? 'i-lucide-mail-check' : 'i-lucide-mail-x',
        label: '邮箱',
        value: comment.emailHash ? '有邮箱 hash' : '无邮箱 hash',
        tone: comment.emailHash ? 'success' : 'warning',
      }
    )
  }

  items.push(
    {
      key: 'location',
      icon: 'i-lucide-map-pin',
      value: comment.locationLabel || '未知',
      tone: comment.locationLabel ? 'muted' : 'warning',
    },
    {
      key: 'os',
      icon: getOsIcon(ua.os),
      value: ua.os,
      tone: ua.os === '未知' ? 'warning' : 'muted',
    },
    {
      key: 'browser',
      icon: getBrowserIcon(ua.browser),
      value: ua.browser,
      tone: ua.browser === '未知' ? 'warning' : 'muted',
    }
  )

  return items
}

export function CommentMetaChip({ item }: { item: CommentMetaItem }) {
  const tone = item.tone || 'muted'
  const title = item.title || (item.label ? `${item.label}：${item.value}` : item.value)

  return (
    <span
      className={`inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border px-2 text-xs ${toneClass[tone]}`}
      title={title}
    >
      <span className={`${item.icon} shrink-0 text-[13px]`} aria-hidden="true" />
      {item.label && <span className="shrink-0 text-[11px] opacity-75">{item.label}</span>}
      <span className="min-w-0 truncate font-medium">{item.value}</span>
    </span>
  )
}

export function CommentMetaChips({
  items,
  className = '',
  variant = 'boxed',
}: {
  items: CommentMetaItem[]
  className?: string
  variant?: 'boxed' | 'inline'
}) {
  if (variant === 'inline') {
    return (
      <div className={`flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted ${className}`}>
        {items.map(item => (
          <span
            key={item.key}
            className="inline-flex max-w-full items-center gap-1.5"
            title={item.title || (item.label ? `${item.label}：${item.value}` : item.value)}
          >
            <span className={`${item.icon} shrink-0 text-[14px] opacity-80`} aria-hidden="true" />
            <span className="min-w-0 truncate">{item.value}</span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-2 ${className}`}>
      {items.map(item => (
        <CommentMetaChip key={item.key} item={item} />
      ))}
    </div>
  )
}

export function CommentUaDetails({ comment }: { comment: AdminComment }) {
  return (
    <details className="text-xs text-muted-foreground">
      <summary className="inline-flex cursor-pointer items-center gap-1 rounded-md px-0 py-0.5 text-foreground hover:text-muted-foreground">
        请求与 UA 详情
      </summary>
      <div className="mt-1 grid gap-1 rounded-md bg-card/35 px-2 py-1.5">
        <div>来源：{comment.locationLabel || '未知'}</div>
        <div>设备：{comment.uaSummary || '未知'}</div>
        <div className="break-all">原始 UA：{comment.userAgent || '无'}</div>
      </div>
    </details>
  )
}
