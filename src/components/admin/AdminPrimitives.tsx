import Link from 'next/link'
import type { ComponentProps, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import type { CommentStatus, ContentStatus, PostStatus } from '@/types/supabase'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AdminItemHeaderActions } from './AdminItemHeaderActions'
export { AdminSelect } from './AdminSelect'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'muted'
type FieldSpan = 1 | 2 | 3 | 4 | 6 | 'full'

const toneClass: Record<Tone, string> = {
  neutral: 'border-border bg-background text-foreground',
  success: 'border-emerald-500/25 bg-background text-emerald-600 dark:text-emerald-400',
  warning: 'border-amber-500/25 bg-background text-amber-600 dark:text-amber-400',
  danger: 'border-red-500/25 bg-background text-red-600 dark:text-red-400',
  muted: 'border-border bg-background text-muted',
}

const softToneClass: Record<Tone, string> = {
  neutral: 'border-border bg-background text-foreground',
  success: 'border-border bg-background text-emerald-600 dark:text-emerald-400',
  warning: 'border-border bg-background text-amber-600 dark:text-amber-400',
  danger: 'border-border bg-background text-red-600 dark:text-red-400',
  muted: 'border-border bg-background text-muted',
}

function AdminBreadcrumb({ value }: { value: string }) {
  const items = value.split('/').map(item => item.trim()).filter(Boolean)

  return (
    <nav aria-label="当前位置" className="mb-2 min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-[11px] font-medium text-muted">
        {items.map((item, index) => {
          const current = index === items.length - 1

          return (
            <li key={`${item}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && <span className="i-lucide-chevron-right shrink-0 text-[12px] text-muted/55" />}
              <span
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'max-w-36 truncate',
                  current ? 'text-foreground/80' : 'text-muted'
                )}
              >
                {item}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function AdminPageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <AdminBreadcrumb value={eyebrow} />
        <h2 className="truncate text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function AdminPanel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Card size="sm" className={cn('gap-0 rounded-lg border-[var(--admin-border)] bg-[var(--admin-surface)] py-0 shadow-[var(--admin-shadow)]', className)}>
      {children}
    </Card>
  )
}

export function AdminPanelHeader({
  title,
  description,
  icon,
}: {
  title: string
  description?: string
  icon?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3 md:px-5">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
      </div>
      {icon && <span className={`${icon} mt-0.5 text-base text-muted`} />}
    </div>
  )
}

export function AdminCreatePanel({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon?: string
  children: ReactNode
}) {
  return (
    <AdminPanel>
      <details className="group">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none transition-colors hover:bg-[var(--admin-accent-soft)] md:px-5 [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--admin-border)] bg-background text-muted">
                <span className={`${icon} text-base`} />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
              {description && <p className="mt-0.5 truncate text-xs text-muted">{description}</p>}
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-muted">
            <span className="hidden group-open:inline">收起</span>
            <span className="group-open:hidden">展开</span>
            <span className="i-lucide-chevron-down text-sm transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="border-t border-[var(--admin-border)]">
          {children}
        </div>
      </details>
    </AdminPanel>
  )
}

export function AdminStat({
  label,
  value,
  icon,
  hint,
  tone = 'muted',
}: {
  label: string
  value: number | string
  icon: string
  hint: string
  tone?: Tone
}) {
  return (
    <AdminPanel className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md border', toneClass[tone])}>
          <span className={`${icon} text-sm`} />
        </span>
        <span className="truncate text-sm font-medium text-muted">{label}</span>
      </div>
      <div className="text-2xl font-semibold leading-none text-foreground">{value}</div>
      <p className="mt-2 truncate text-xs text-muted">{hint}</p>
    </AdminPanel>
  )
}

export function StatusBadge({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: Tone
}) {
  return (
    <Badge variant="outline" className={cn('h-6 rounded-md px-2 text-[11px] font-medium', toneClass[tone])}>
      {children}
    </Badge>
  )
}

export function AdminEmptyState({
  icon = 'i-lucide-inbox',
  title,
  body,
}: {
  icon?: string
  title: string
  body: string
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-8 text-center">
      <span className={`${icon} mb-3 text-xl text-muted`} />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
    </div>
  )
}

export function AdminIconLink({
  icon,
  label,
  ...props
}: ComponentProps<typeof Link> & {
  icon: string
  label: string
}) {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'text-muted-foreground hover:text-foreground')}
      title={label}
      aria-label={label}
    >
      <span className={`${icon} text-sm`} />
    </Link>
  )
}

export function AdminTextLink({
  icon,
  children,
  className = '',
  ...props
}: ComponentProps<typeof Link> & {
  icon?: string
}) {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), className)}
    >
      {icon && <span className={`${icon} text-base`} />}
      {children}
    </Link>
  )
}

export function AdminButtonLink({
  icon,
  children,
  variant = 'secondary',
  className = '',
  ...props
}: ComponentProps<typeof Link> & {
  icon?: string
  variant?: 'primary' | 'secondary'
}) {
  return (
    <Link
      {...props}
      className={cn(
        buttonVariants({ variant: variant === 'primary' ? 'default' : 'outline', size: 'lg' }),
        className
      )}
    >
      {icon && <span className={`${icon} text-base`} />}
      {children}
    </Link>
  )
}

export function AdminSubmitButton({
  icon,
  children,
  className = '',
}: {
  icon?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Button type="submit" size="lg" className={className}>
      {icon && <span className={`${icon} text-base`} />}
      {children}
    </Button>
  )
}

export function AdminDangerButton({
  children,
  icon,
  className = '',
}: {
  children: ReactNode
  icon?: string
  className?: string
}) {
  return (
    <Button type="submit" variant="destructive" size="sm" className={className}>
      {icon && <span className={`${icon} text-sm`} />}
      {children}
    </Button>
  )
}

const controlClass = 'w-full border-[var(--admin-border)] bg-background shadow-none'
const controlHeightClass = 'h-9'

const spanClass: Record<FieldSpan, string> = {
  1: '',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  6: 'md:col-span-6',
  full: 'md:col-span-full',
}

export function AdminFormGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: ReactNode
  columns?: 2 | 3 | 4 | 6
  className?: string
}) {
  const columnsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
  }[columns]

  return (
    <div className={cn('grid gap-3 px-4 py-4 md:px-5', columnsClass, className)}>
      {children}
    </div>
  )
}

export function AdminField({
  label,
  children,
  span = 1,
  hint,
  className = '',
}: {
  label: string
  children: ReactNode
  span?: FieldSpan
  hint?: ReactNode
  className?: string
}) {
  return (
    <label className={cn('grid min-w-0 gap-1.5 text-xs font-medium text-muted', spanClass[span], className)}>
      <span className="truncate">{label}</span>
      {children}
      {hint && <span className="text-[11px] font-normal leading-relaxed text-muted/80">{hint}</span>}
    </label>
  )
}

export function AdminInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className={cn(controlClass, controlHeightClass, className)} />
}

export function AdminTextarea({ className = '', rows = 3, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Textarea {...props} rows={rows} className={cn(controlClass, 'min-h-22 resize-y py-2 leading-relaxed', className)} />
}

export function AdminFileInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="file"
      className={cn(
        controlClass,
        'h-9 cursor-pointer rounded-md border px-3 py-1.5 text-xs file:mr-3 file:h-6 file:rounded file:border-0 file:bg-foreground file:px-2.5 file:text-xs file:font-medium file:text-background file:hover:opacity-85',
        className
      )}
    />
  )
}

export function AdminCheckbox({
  label,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode
}) {
  return (
    <label className={cn('inline-flex h-9 min-w-0 items-center gap-2 rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground shadow-none', className)}>
      <input {...props} type="checkbox" className="h-4 w-4 accent-foreground" />
      <span className="truncate">{label}</span>
    </label>
  )
}

export function AdminFormActions({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 border-t border-[var(--admin-border)] px-4 py-3 md:px-5', className)}>
      {children}
    </div>
  )
}

export function AdminInlineMeta({
  items,
  className = '',
}: {
  items: Array<ReactNode | false | null | undefined>
  className?: string
}) {
  const visibleItems = items.filter(Boolean)

  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted', className)}>
      {visibleItems.map((item, index) => (
        <span key={index} className="min-w-0 truncate">
          {item}
          {index < visibleItems.length - 1 && <span className="ml-2 text-muted/50">/</span>}
        </span>
      ))}
    </div>
  )
}

export function getContentStatusLabel(status: ContentStatus | string) {
  const labels: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '归档',
  }

  return labels[status] || status
}

export function AdminItemHeader({
  title,
  meta,
  status,
  actions,
}: {
  title: ReactNode
  meta?: Array<ReactNode | false | null | undefined>
  status?: ContentStatus | string
  actions?: ReactNode
}) {
  return (
    <summary className="group flex cursor-pointer list-none items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3 outline-none transition-colors hover:bg-[var(--admin-accent-soft)] md:px-5 [&::-webkit-details-marker]:hidden">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{title}</span>
          <span className="inline-flex h-5 items-center rounded border border-[var(--admin-border)] bg-background px-1.5 text-[10px] font-medium text-muted">
            <span className="hidden group-open:inline">收起</span>
            <span className="group-open:hidden">编辑</span>
          </span>
        </div>
        {meta && <AdminInlineMeta items={meta} className="mt-1" />}
      </div>
      <AdminItemHeaderActions>
        {status && <StatusBadge tone={getStatusTone(status)}>{getContentStatusLabel(status)}</StatusBadge>}
        {actions}
      </AdminItemHeaderActions>
    </summary>
  )
}

export function getStatusTone(status: string): Tone {
  if (status === 'published' || status === 'approved') return 'success'
  if (status === 'draft' || status === 'pending') return 'warning'
  if (status === 'spam' || status === 'deleted') return 'danger'
  return 'muted'
}

export function getPostStatusLabel(status: PostStatus) {
  const labels: Record<PostStatus, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
  }

  return labels[status]
}

export function getCommentStatusLabel(status: CommentStatus) {
  const labels: Record<CommentStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    spam: '垃圾',
    deleted: '已删除',
  }

  return labels[status]
}

export function AdminFilterLink({
  active,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  active?: boolean
}) {
  return (
    <Link
      {...props}
      className={cn(
        'inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium shadow-none',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-[var(--admin-border)] bg-background text-muted hover:border-[var(--admin-border-strong)] hover:text-foreground'
      )}
    >
      {children}
    </Link>
  )
}

export function AdminTable({
  columns,
  children,
}: {
  columns: string
  children: ReactNode
}) {
  return (
    <AdminPanel className="overflow-hidden">
      <div className={cn('hidden border-b border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-3 text-xs font-medium text-muted lg:grid', columns)}>
        {children}
      </div>
    </AdminPanel>
  )
}

export function AdminInfoList({
  items,
}: {
  items: Array<{
    label: string
    value: ReactNode
    tone?: Tone
  }>
}) {
  return (
    <div className="grid gap-3">
      {items.map(item => (
        <div key={item.label} className={cn('flex items-center justify-between gap-3 rounded-md border px-4 py-3', softToneClass[item.tone || 'muted'])}>
          <span className="text-sm text-muted">{item.label}</span>
          <span className="text-sm font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function formatAdminAction(action: string) {
  const labels: Record<string, string> = {
    create: '新建',
    update: '更新',
    moderate: '审核',
    approved: '通过',
    pending: '设为待审',
    spam: '标记垃圾',
    deleted: '删除',
    permanent_delete: '永久删除',
    delete: '删除',
    refresh_feed_snapshots: '刷新',
    update_emoji_packs: '更新',
    update_avatar_provider: '更新',
    update_friend_application_settings: '更新',
    handle_friend_application: '处理',
    reject_friend_application: '拒绝',
  }

  return labels[action] || action
}

export function formatAdminEntity(entity: string) {
  const labels: Record<string, string> = {
    post: '文章',
    comment: '评论',
    profile: '用户',
    watched_item: '电影推荐',
    album_category: '相册分类',
    album_photo: '相册照片',
    stack_category: 'Stack 分类',
    stack_item: 'Stack 条目',
    friend_group: '友链分组',
    friend_link: '友链',
    friend_application_settings: '友链申请配置',
    friend_link_application: '友链申请',
    friend_feed_snapshots: '朋友圈快照',
    home_section: '首页区块',
    comment_settings: '评论配置',
  }

  return labels[entity] || entity
}
