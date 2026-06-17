import { updateUserRole } from '@/app/admin/actions'
import { getAdminUsers, profileRoles } from '@/server/users/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { AdminEmptyState, AdminPageHeader, AdminPanel, StatusBadge, getRoleLabel, getRoleTone } from '@/components/admin/AdminPrimitives'

export const dynamic = 'force-dynamic'

function formatDateTime(value: string | null) {
  if (!value) return '从未登录'

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function AdminUsersPage() {
  await requireAdminPage('/admin/users')
  const users = await getAdminUsers()
  const adminCount = users.filter(user => user.role === 'admin').length

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="系统 / 成员权限"
        title="成员权限"
        description={`${users.length} 位用户，${adminCount} 位管理员。`}
      />

      {users.length === 0 ? (
        <AdminEmptyState title="暂无用户" body="用户完成登录后会出现在这里。" icon="i-lucide-users-round" />
      ) : (
        <AdminPanel className="overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-3 text-xs font-medium text-muted lg:grid-cols-[1.2fr_1fr_120px_180px_220px]">
            <span>用户</span>
            <span className="hidden lg:block">GitHub</span>
            <span className="hidden lg:block">角色</span>
            <span className="hidden lg:block">最近登录</span>
            <span className="text-right">权限操作</span>
          </div>
          {users.map(user => (
            <article key={user.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--admin-border)] px-4 py-4 transition-colors last:border-b-0 hover:bg-[var(--admin-accent-soft)] lg:grid-cols-[1.2fr_1fr_120px_180px_220px]">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="i-lucide-user text-base text-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {user.displayName || user.email || user.id}
                    </div>
                    <div className="truncate text-xs text-muted">{user.email || user.id}</div>
                    <div className="truncate text-xs text-muted">注册于 {formatDateTime(user.createdAt)}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
                  <StatusBadge tone={getRoleTone(user.role)}>{getRoleLabel(user.role)}</StatusBadge>
                  <span className="text-xs text-muted">
                    {user.githubUsername ? `@${user.githubUsername}` : '未绑定 GitHub'}
                  </span>
                </div>
              </div>

              <span className="hidden truncate text-sm text-muted lg:block">
                {user.githubUsername ? `@${user.githubUsername}` : '-'}
              </span>
              <span className="hidden lg:block">
                <StatusBadge tone={getRoleTone(user.role)}>{getRoleLabel(user.role)}</StatusBadge>
              </span>
              <span className="hidden text-sm text-muted lg:block">{formatDateTime(user.lastSignInAt)}</span>

              <form action={updateUserRole} className="flex justify-end gap-2">
                <input type="hidden" name="id" value={user.id} />
                {profileRoles.map(role => (
                  <button
                    key={role}
                    type="submit"
                    name="role"
                    value={role}
                    disabled={user.role === role}
                    className="h-8 rounded-md border border-[var(--admin-border)] bg-background px-3 text-xs font-medium text-muted hover:border-[var(--admin-border-strong)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {role === 'admin' ? '设为管理员' : '设为普通用户'}
                  </button>
                ))}
              </form>
            </article>
          ))}
        </AdminPanel>
      )}
    </section>
  )
}
