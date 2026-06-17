import type { ReactNode } from 'react'
import { AdminFilterLink, AdminPanel } from './AdminPrimitives'

interface AdminPostsFiltersProps {
  params: {
    status?: string
    keyword?: string
  }
  summary?: ReactNode
}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })

  const value = query.toString()
  return value ? `?${value}` : ''
}

export default function AdminPostsFilters({ params, summary }: AdminPostsFiltersProps) {
  const shared = {
    keyword: params.keyword,
  }

  return (
    <AdminPanel className="p-3">
      <div className="mb-3 flex flex-col gap-3 border-b border-[var(--admin-border)] pb-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-sm font-semibold text-foreground">文章筛选</h3>
        {summary}
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <form action="/admin/posts" className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="space-y-2 text-xs font-medium text-muted">
            关键词
            <input
              name="keyword"
              defaultValue={params.keyword || ''}
              placeholder="搜索标题、路径、摘要"
              className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]"
            />
          </label>
          <button type="submit" className="inline-flex h-9 items-center justify-center gap-2 self-end rounded-md border border-[var(--admin-border)] bg-background px-4 text-sm font-medium text-foreground hover:border-[var(--admin-border-strong)]">
            <span className="i-lucide-search text-base" />
            查询
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          <AdminFilterLink href={`/admin/posts${buildQuery(shared)}`} active={!params.status}>全部</AdminFilterLink>
          <AdminFilterLink href={`/admin/posts${buildQuery({ ...shared, status: 'published' })}`} active={params.status === 'published'}>已发布</AdminFilterLink>
          <AdminFilterLink href={`/admin/posts${buildQuery({ ...shared, status: 'draft' })}`} active={params.status === 'draft'}>草稿</AdminFilterLink>
          <AdminFilterLink href={`/admin/posts${buildQuery({ ...shared, status: 'archived' })}`} active={params.status === 'archived'}>已归档</AdminFilterLink>
        </div>
      </div>
    </AdminPanel>
  )
}
