import Link from 'next/link'
import { getAdminDashboardSummary } from '@/server/admin/adapters/page'
import { getPostHref } from '@/server/posts/contracts/routes'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { formatDate, formatTimeAgo } from '@/lib/utils'
import {
  AdminButtonLink,
  AdminEmptyState,
  AdminInfoList,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminStat,
  StatusBadge,
  formatAdminAction,
  formatAdminEntity,
  getCommentStatusLabel,
  getPostStatusLabel,
  getStatusTone,
} from '@/components/admin/AdminPrimitives'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdminPage('/admin')
  const summary = await getAdminDashboardSummary()

  const stats = [
    { label: '文章', value: summary.postTotal, icon: 'i-lucide-files', hint: `${summary.publishedPosts} 篇已发布`, tone: 'muted' as const },
    { label: '草稿', value: summary.draftPosts, icon: 'i-lucide-file-pen-line', hint: '待继续编辑', tone: 'warning' as const },
    { label: '待审评论', value: summary.pendingComments, icon: 'i-lucide-circle-alert', hint: '需要处理', tone: summary.pendingComments > 0 ? 'danger' as const : 'success' as const },
    { label: '成员', value: summary.userTotal, icon: 'i-lucide-users-round', hint: `${summary.adminTotal} 位管理员`, tone: 'muted' as const },
  ]

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="概览 / 工作台"
        title="管理工作台"
        description="查看待办、内容状态和近期后台操作。"
        actions={(
          <AdminButtonLink href="/admin/posts/new" icon="i-lucide-plus" variant="primary">
            新建文章
          </AdminButtonLink>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(card => (
          <AdminStat key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <AdminPanel>
          <AdminPanelHeader title="关键待办" icon="i-lucide-list-checks" />
          <div className="space-y-3 p-4 md:p-5">
            <AdminInfoList
              items={[
                { label: '待审评论', value: summary.pendingComments, tone: summary.pendingComments > 0 ? 'danger' : 'success' },
                { label: '草稿文章', value: summary.draftPosts, tone: summary.draftPosts > 0 ? 'warning' : 'muted' },
                { label: '垃圾评论', value: summary.spamComments, tone: summary.spamComments > 0 ? 'warning' : 'muted' },
              ]}
            />
            <div className="grid gap-3">
              {summary.pendingCommentItems.map(comment => (
                <Link key={comment.id} href="/admin/comments?status=pending" className="rounded-md border border-[var(--admin-border)] bg-background p-3 hover:border-[var(--admin-border-strong)] hover:opacity-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-foreground">{comment.authorName}</span>
                    <StatusBadge tone={getStatusTone(comment.status)}>{getCommentStatusLabel(comment.status)}</StatusBadge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{comment.body}</p>
                </Link>
              ))}
              {summary.pendingCommentItems.length === 0 && (
                <AdminEmptyState icon="i-lucide-check-circle-2" title="暂无待审核评论" body="当前互动队列保持干净，可以继续关注内容发布。" />
              )}
            </div>
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="内容概览" icon="i-lucide-bar-chart-3" />
          <div className="p-4 md:p-5">
            <AdminInfoList
              items={[
                { label: '已发布', value: summary.publishedPosts, tone: 'success' },
                { label: '草稿', value: summary.draftPosts, tone: 'warning' },
                { label: '已归档', value: summary.archivedPosts, tone: 'muted' },
                { label: '已通过评论', value: summary.approvedComments, tone: 'success' },
                { label: '评论总数', value: summary.commentTotal, tone: 'muted' },
              ]}
            />
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AdminPanel>
          <AdminPanelHeader title="最近更新文章" icon="i-lucide-clock-3" />
          <div className="divide-y divide-[var(--admin-border)]">
            {summary.recentPosts.map(post => (
              <div key={post.id} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
                <div className="min-w-0">
                  <Link href={`/admin/posts/${post.id}`} className="truncate text-sm font-medium text-foreground hover:opacity-70">
                    {post.title}
                  </Link>
                  <p className="truncate text-xs text-muted">{getPostHref(post)} · 更新于 {formatDate(post.updatedAt)}</p>
                </div>
                <StatusBadge tone={getStatusTone(post.status)}>{getPostStatusLabel(post.status)}</StatusBadge>
              </div>
            ))}
            {summary.recentPosts.length === 0 && (
              <div className="p-4 md:p-5">
                <AdminEmptyState title="暂无文章" body="新建第一篇文章后，这里会展示最近更新内容。" />
              </div>
            )}
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3 md:px-5">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">近期操作</h3>
            </div>
            <Link href="/admin/audit" className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[var(--admin-border)] bg-background px-2.5 text-xs font-medium text-muted hover:border-[var(--admin-border-strong)] hover:text-foreground">
              查看全部
              <span className="i-lucide-arrow-right text-sm" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--admin-border)]">
            {summary.auditLogs.map(log => (
              <div key={log.id} className="px-4 py-3 md:px-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {formatAdminAction(log.action)}{formatAdminEntity(log.entityType)}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{formatTimeAgo(log.createdAt, true)}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted">{log.entityId || '系统记录'}</p>
              </div>
            ))}
            {summary.auditLogs.length === 0 && (
              <div className="p-4 md:p-5">
                <AdminEmptyState icon="i-lucide-activity" title="暂无操作记录" body="文章保存、评论审核、角色调整后会在这里出现。" />
              </div>
            )}
          </div>
        </AdminPanel>
      </div>
    </section>
  )
}
