import CopyPathButton from '@/components/admin/CopyPathButton'
import type { AdminPost } from '@/server/posts/contracts/types'
import { getPostHref } from '@/server/posts/contracts/routes'
import { formatDate } from '@/lib/utils'
import {
  AdminEmptyState,
  AdminIconLink,
  AdminPanel,
  StatusBadge,
  getPostStatusLabel,
  getStatusTone,
} from './AdminPrimitives'

interface AdminPostsListProps {
  posts: AdminPost[]
}

function Metric({ icon, value, label }: { icon: string, value: number, label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted" title={label}>
      <span className={`${icon} text-[11px]`} />
      {value}
    </span>
  )
}

export default function AdminPostsList({ posts }: AdminPostsListProps) {
  return (
    <AdminPanel className="overflow-hidden">
      <div className="hidden grid-cols-[1fr_110px_100px_120px_120px_150px] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-3 text-xs font-medium text-muted lg:grid">
        <span>文章</span>
        <span>状态</span>
        <span>分类</span>
        <span>互动</span>
        <span>日期</span>
        <span className="text-right">操作</span>
      </div>
      {posts.map(post => (
        <article key={post.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--admin-border)] px-4 py-4 transition-colors last:border-b-0 hover:bg-[var(--admin-accent-soft)] lg:grid-cols-[1fr_110px_100px_120px_120px_150px]">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{post.title}</span>
              <span className="lg:hidden">
                <StatusBadge tone={getStatusTone(post.status)}>
                  {getPostStatusLabel(post.status)}
                </StatusBadge>
              </span>
              {post.recent && (
                <StatusBadge>近期推荐</StatusBadge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="truncate text-xs text-muted">{getPostHref(post)}</p>
              <span className="flex gap-2 lg:hidden">
                <Metric icon="i-lucide-eye" value={post.viewCount} label="浏览量" />
                <Metric icon="i-lucide-heart" value={post.likeCount} label="点赞数" />
              </span>
            </div>
          </div>
          <span className="hidden lg:block">
            <StatusBadge tone={getStatusTone(post.status)}>
              {getPostStatusLabel(post.status)}
            </StatusBadge>
          </span>
          <span className="hidden text-sm text-muted lg:block">{post.category}</span>
          <span className="hidden items-center gap-2 lg:flex">
            <Metric icon="i-lucide-eye" value={post.viewCount} label="浏览量" />
            <Metric icon="i-lucide-heart" value={post.likeCount} label="点赞数" />
          </span>
          <span className="hidden text-sm text-muted lg:block">{formatDate(post.date)}</span>
          <div className="flex items-center justify-end gap-2">
            {post.status === 'published' && (
              <AdminIconLink
                href={getPostHref(post)}
                icon="i-lucide-eye"
                label={`查看 ${post.title}`}
              />
            )}
            <CopyPathButton value={getPostHref(post)} />
            <AdminIconLink
              href={`/admin/posts/${post.id}`}
              icon="i-lucide-pencil"
              label={`编辑 ${post.title}`}
            />
          </div>
        </article>
      ))}
      {posts.length === 0 && (
        <div className="p-4">
          <AdminEmptyState title="暂无文章" body="当前筛选没有匹配的内容，可以调整条件或新建草稿。" />
        </div>
      )}
    </AdminPanel>
  )
}
