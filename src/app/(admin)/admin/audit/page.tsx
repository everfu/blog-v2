import { getRecentAdminAuditLogs } from '@/server/admin/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { formatTimeAgo } from '@/lib/utils'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminPanelHeader, formatAdminAction, formatAdminEntity } from '@/components/admin/AdminPrimitives'

export const dynamic = 'force-dynamic'

export default async function AdminAuditPage() {
  await requireAdminPage('/admin/audit')
  const logs = await getRecentAdminAuditLogs(50)

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="系统 / 操作日志"
        title="操作日志"
        description="只读查看最近后台关键操作。"
      />

      <AdminPanel>
        <AdminPanelHeader title="最近操作" description="记录内容维护、评论审核和角色调整。" icon="i-lucide-activity" />
        <div className="divide-y divide-border">
          {logs.map(log => (
            <div key={log.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_160px_180px] md:items-center md:px-5">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {formatAdminAction(log.action)}{formatAdminEntity(log.entityType)}
                </div>
                <div className="mt-1 truncate text-xs text-muted">
                  对象：{log.entityId || '系统'} · 操作人：{log.actorId || '未知'}
                </div>
              </div>
              <div className="text-sm text-muted">{formatTimeAgo(log.createdAt, true)}</div>
              <code className="truncate rounded-md border border-[var(--admin-border)] bg-background px-2 py-1 text-xs text-muted">
                {JSON.stringify(log.metadata)}
              </code>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-4 md:p-5">
              <AdminEmptyState icon="i-lucide-activity" title="暂无操作日志" body="文章保存、评论审核、角色调整后会生成审计记录。" />
            </div>
          )}
        </div>
      </AdminPanel>
    </section>
  )
}
