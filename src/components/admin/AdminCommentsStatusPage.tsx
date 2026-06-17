import Link from 'next/link'
import type { ReactNode } from 'react'
import { getAdminCommentSummary, getAdminComments } from '@/server/comments/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { AdminPageHeader, AdminPanel, getCommentStatusLabel } from '@/components/admin/AdminPrimitives'
import AdminCommentsList from '@/components/admin/AdminCommentsList'
import type { CommentStatus } from '@/types/supabase'

type CommentStatusFilter = CommentStatus | 'all'

const statusOptions: Array<{
  value: CommentStatusFilter
  label: string
}> = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'spam', label: '垃圾评论' },
  { value: 'deleted', label: '已删除' },
]

const statusEmptyCopy: Record<CommentStatusFilter, string> = {
  all: '当前没有评论。',
  pending: '当前没有待审核评论。',
  approved: '当前没有已通过评论。',
  spam: '当前没有垃圾评论。',
  deleted: '当前没有已删除评论。',
}

const statusDotClass: Record<CommentStatusFilter, string> = {
  all: 'bg-foreground/70',
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  spam: 'bg-red-500',
  deleted: 'bg-red-500/70',
}

const filterInputClass = 'h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 pl-8 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 hover:border-[var(--admin-border-strong)] focus:border-foreground'

interface AdminCommentsStatusPageProps {
  searchParams: {
    status?: string
    keyword?: string
    pagePath?: string
    createdFrom?: string
    createdTo?: string
    error?: string
  }
}

function getErrorMessage(error?: string) {
  if (error === 'invalid-comment') return '请选择评论并指定有效的审核状态。'
  if (error === 'save') return '评论状态保存失败。'
  if (error === 'attachment-save') return '评论状态已更新，但附件状态保存失败。'
  if (error === 'moderation-event') return '评论已更新，但运营记录写入失败。'
  if (error === 'audit') return '评论状态已更新，但审计日志写入失败。'
  return null
}

function parseStatusFilter(status?: string): CommentStatusFilter {
  if (status === 'pending' || status === 'approved' || status === 'spam' || status === 'deleted') return status
  return 'all'
}

function buildStatusHref(
  status: CommentStatusFilter,
  filters: {
    keyword?: string
    pagePath?: string
    createdFrom?: string
    createdTo?: string
  }
) {
  const params = new URLSearchParams()
  if (status !== 'all') params.set('status', status)
  if (filters.keyword) params.set('keyword', filters.keyword)
  if (filters.pagePath) params.set('pagePath', filters.pagePath)
  if (filters.createdFrom) params.set('createdFrom', filters.createdFrom)
  if (filters.createdTo) params.set('createdTo', filters.createdTo)
  const query = params.toString()
  return `/admin/comments${query ? `?${query}` : ''}`
}

function getStatusCount(status: CommentStatusFilter, summary: Awaited<ReturnType<typeof getAdminCommentSummary>>) {
  if (status === 'all') return summary.total
  return summary[status]
}

function getStatusFilterLabel(status: CommentStatusFilter) {
  return status === 'all' ? '全部' : getCommentStatusLabel(status)
}

function FilterField({
  label,
  icon,
  children,
}: {
  label: string
  icon: string
  children: ReactNode
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-[11px] font-medium text-muted">
      <span className="truncate">{label}</span>
      <span className="relative block">
        <span className={`${icon} pointer-events-none absolute left-2.5 top-1/2 text-sm text-muted/80 -translate-y-1/2`} />
        {children}
      </span>
    </label>
  )
}

export default async function AdminCommentsStatusPage({
  searchParams,
}: AdminCommentsStatusPageProps) {
  await requireAdminPage('/admin/comments')
  const status = parseStatusFilter(searchParams.status)
  const keyword = searchParams.keyword?.trim() || undefined
  const pagePath = searchParams.pagePath?.trim() || undefined
  const createdFrom = searchParams.createdFrom?.trim() || undefined
  const createdTo = searchParams.createdTo?.trim() || undefined
  const [comments, summary] = await Promise.all([
    getAdminComments({ status, keyword, pagePath, createdFrom, createdTo, sort: 'newest' }),
    getAdminCommentSummary({ status, keyword, pagePath, createdFrom, createdTo, sort: 'newest' }),
  ])
  const errorMessage = getErrorMessage(searchParams.error)

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="互动运营 / 评论"
        title="评论管理"
      />

      {errorMessage && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {errorMessage}
        </div>
      )}

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex max-w-full flex-wrap gap-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-1">
            {statusOptions.map(option => {
              const active = option.value === status
              const count = getStatusCount(option.value, summary)

              return (
                <Link
                  key={option.value}
                  href={buildStatusHref(option.value, { keyword, pagePath, createdFrom, createdTo })}
                  data-active={active}
                  aria-current={active ? 'page' : undefined}
                  className="inline-flex h-8 items-center gap-2 rounded-[6px] border border-transparent px-2.5 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground hover:opacity-100 data-[active=true]:border-[var(--admin-border)] data-[active=true]:bg-background data-[active=true]:text-foreground"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass[option.value]}`} />
                  <span>{option.label}</span>
                  <span className="tabular-nums text-muted">{count}</span>
                </Link>
              )
            })}
          </div>
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
            <span className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-md border border-[var(--admin-border)] bg-background px-2.5">
              <span className="i-lucide-list-filter shrink-0 text-sm" />
              <span className="truncate">{getStatusFilterLabel(status)}</span>
              <span className="font-semibold tabular-nums text-foreground">{summary.filtered}</span>
            </span>
          </div>
        </div>
        <form action="/admin/comments" className="grid gap-3 px-3 py-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.35fr)_minmax(180px,1fr)_minmax(140px,0.55fr)_minmax(140px,0.55fr)_auto]">
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <FilterField label="关键词" icon="i-lucide-search">
            <input
              name="keyword"
              defaultValue={keyword || ''}
              placeholder="搜索作者、正文、页面、地区、浏览器、系统、设备"
              className={filterInputClass}
            />
          </FilterField>
          <FilterField label="页面路径" icon="i-lucide-link-2">
            <input
              name="pagePath"
              defaultValue={pagePath || ''}
              placeholder="/2025/example"
              className={filterInputClass}
            />
          </FilterField>
          <FilterField label="开始日期" icon="i-lucide-calendar-days">
            <input
              name="createdFrom"
              type="date"
              defaultValue={createdFrom || ''}
              className={filterInputClass}
            />
          </FilterField>
          <FilterField label="结束日期" icon="i-lucide-calendar-check">
            <input
              name="createdTo"
              type="date"
              defaultValue={createdTo || ''}
              className={filterInputClass}
            />
          </FilterField>
          <button type="submit" className="inline-flex h-9 w-full items-center justify-center gap-2 self-end rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85 sm:col-span-2 xl:col-span-1 xl:w-auto">
            <span className="i-lucide-search text-base" />
            查询
          </button>
        </form>
      </AdminPanel>

      <AdminCommentsList comments={comments} emptyBody={statusEmptyCopy[status]} />
    </section>
  )
}
