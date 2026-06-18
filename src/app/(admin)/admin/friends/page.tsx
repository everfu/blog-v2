import { approveFriendApplicationAction, deleteFriendLinkAction, refreshFriendFeeds, saveFriendApplicationSettingsAction, saveFriendGroupAction, saveFriendLinkAction, updateFriendApplicationStatusAction } from '@/app/admin/actions'
import { getAdminFriendApplications, getAdminFriends, getFriendApplicationSettings } from '@/server/content/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { formatDate, formatTimeAgo } from '@/lib/utils'
import {
  AdminCreatePanel,
  AdminCheckbox,
  AdminDangerButton,
  AdminEmptyState,
  AdminField,
  AdminFileInput,
  AdminFormActions,
  AdminFormGrid,
  AdminInput,
  AdminItemHeader,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminSelect,
  AdminSubmitButton,
  AdminTextarea,
  StatusBadge,
} from '@/components/admin/AdminPrimitives'
import AdminMediaHint from '@/components/admin/AdminMediaHint'

export const dynamic = 'force-dynamic'

function GroupForm({ group }: { group?: Awaited<ReturnType<typeof getAdminFriends>>['groups'][number] }) {
  return (
    <form action={saveFriendGroupAction}>
      <input type="hidden" name="id" value={group?.id || ''} />
      <AdminFormGrid columns={4}>
        <AdminField label="Slug">
          <AdminInput name="slug" defaultValue={group?.slug} required />
        </AdminField>
        <AdminField label="名称">
          <AdminInput name="name" defaultValue={group?.name} required />
        </AdminField>
        <AdminField label="状态">
          <AdminSelect name="status" defaultValue={group?.status || 'published'}><option value="published">已发布</option><option value="draft">草稿</option><option value="archived">归档</option></AdminSelect>
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={group?.sortOrder || 0} />
        </AdminField>
        <AdminField label="描述" span="full">
          <AdminInput name="description" defaultValue={group?.description} />
        </AdminField>
      </AdminFormGrid>
      <AdminFormActions><AdminSubmitButton icon="i-lucide-save">{group ? '保存分组' : '新增分组'}</AdminSubmitButton></AdminFormActions>
    </form>
  )
}

function LinkForm({
  groups,
  link,
}: {
  groups: Awaited<ReturnType<typeof getAdminFriends>>['groups']
  link?: Awaited<ReturnType<typeof getAdminFriends>>['links'][number]
}) {
  return (
    <form action={saveFriendLinkAction}>
      <input type="hidden" name="id" value={link?.id || ''} />
      <AdminFormGrid columns={4}>
        <AdminField label="分组">
          <AdminSelect name="groupId" defaultValue={link?.groupId || groups[0]?.id || ''}>
            <option value="">无</option>
            {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
          </AdminSelect>
        </AdminField>
        <AdminField label="作者">
          <AdminInput name="author" defaultValue={link?.author} required />
        </AdminField>
        <AdminField label="站点名">
          <AdminInput name="sitenick" defaultValue={link?.sitenick} />
        </AdminField>
        <AdminField label="加入日期">
          <AdminInput name="joinedAt" type="date" defaultValue={link?.joinedAt || new Date().toISOString().slice(0, 10)} required />
        </AdminField>
        <AdminField label="状态">
          <AdminSelect name="status" defaultValue={link?.status || 'published'}><option value="published">已发布</option><option value="draft">草稿</option><option value="archived">归档</option></AdminSelect>
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={link?.sortOrder || 0} />
        </AdminField>
        <AdminField label="技术栈" span={2}>
          <AdminInput name="archs" defaultValue={link?.archs.join(', ')} placeholder="Vercel, Vue" />
        </AdminField>
        <AdminField label="站点 URL" span={2}>
          <AdminInput name="linkUrl" defaultValue={link?.linkUrl} required />
        </AdminField>
        <AdminField label="Feed URL" span={2}>
          <AdminInput name="feedUrl" defaultValue={link?.feedUrl} />
        </AdminField>
        <AdminField label="朋友圈">
          <AdminCheckbox name="feedMuted" defaultChecked={link?.feedMuted} label="免打扰" />
        </AdminField>
        <AdminField label="Avatar URL" span={2}>
          <AdminInput name="avatarUrl" defaultValue={link?.avatarUrl} />
        </AdminField>
        <AdminField label="上传头像" span={2}>
          <AdminFileInput name="avatarFile" accept="image/*" />
        </AdminField>
        <AdminField label="描述" span="full">
          <AdminTextarea name="description" defaultValue={link?.description} />
        </AdminField>
      </AdminFormGrid>
      <AdminFormActions><AdminSubmitButton icon="i-lucide-save">{link ? '保存友链' : '新增友链'}</AdminSubmitButton></AdminFormActions>
    </form>
  )
}

function ApplicationSettingsForm({ enabled }: { enabled: boolean }) {
  return (
    <div className="border-t border-[var(--admin-border)] bg-[var(--admin-surface-muted)]">
      <AdminPanelHeader
        title="友链申请设置"
        description="开启后，Links 页面底部会显示申请表；关闭后 API 也会拒绝新的提交。"
        icon="i-lucide-settings-2"
      />
      <form action={saveFriendApplicationSettingsAction}>
        <div className="px-4 py-4 md:px-5">
          <AdminCheckbox name="enabled" defaultChecked={enabled} label="开启友链申请" />
        </div>
        <AdminFormActions>
          <AdminSubmitButton icon="i-lucide-save">保存设置</AdminSubmitButton>
        </AdminFormActions>
      </form>
    </div>
  )
}

function getApplicationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: '待处理',
    handled: '已处理',
    rejected: '已拒绝',
  }

  return labels[status] || status
}

function ApplicationStatusAction({
  id,
  status,
  children,
  icon,
}: {
  id: string
  status: 'rejected'
  children: string
  icon: string
}) {
  return (
    <form action={updateFriendApplicationStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--admin-border)] bg-background px-3 text-xs font-medium text-muted hover:border-[var(--admin-border-strong)] hover:text-foreground">
        <span className={`${icon} text-sm`} />
        {children}
      </button>
    </form>
  )
}

function ApplicationApprovalAction({
  applicationId,
  groups,
}: {
  applicationId: string
  groups: Awaited<ReturnType<typeof getAdminFriends>>['groups']
}) {
  const hasGroups = groups.length > 0

  return (
    <form action={approveFriendApplicationAction} className="grid gap-2 rounded-md border border-[var(--admin-border)] bg-background p-3 sm:grid-cols-[minmax(180px,1fr)_auto] sm:items-end">
      <input type="hidden" name="id" value={applicationId} />
      <AdminField label="归属分组">
        <AdminSelect name="groupId" defaultValue={groups[0]?.id || ''} disabled={!hasGroups} required>
          {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </AdminSelect>
      </AdminField>
      <button
        disabled={!hasGroups}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-foreground bg-foreground px-3 text-xs font-medium text-background hover:opacity-85 disabled:cursor-not-allowed disabled:border-[var(--admin-border)] disabled:bg-[var(--admin-surface-muted)] disabled:text-muted disabled:opacity-80"
      >
        <span className="i-lucide-check text-sm" />
        通过并创建
      </button>
      {!hasGroups && (
        <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400 sm:col-span-2">
          需要先新增友链分组，才能通过申请。
        </p>
      )}
    </form>
  )
}

function ApplicationInbox({
  applications,
  applicationSettings,
  groups,
}: {
  applications: Awaited<ReturnType<typeof getAdminFriendApplications>>
  applicationSettings: Awaited<ReturnType<typeof getFriendApplicationSettings>>
  groups: Awaited<ReturnType<typeof getAdminFriends>>['groups']
}) {
  const pendingCount = applications.filter(application => application.status === 'pending').length

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="友链申请"
        description={`共有 ${applications.length} 条申请，其中 ${pendingCount} 条待处理。通过后会立即创建公开友链。`}
        icon="i-lucide-inbox"
      />
      {applications.length === 0 ? (
        <div className="px-4 py-5 md:px-5">
          <AdminEmptyState icon="i-lucide-inbox" title="暂无友链申请" body="开启申请后，用户提交的信息会出现在这里。" />
        </div>
      ) : (
        <div className="divide-y divide-[var(--admin-border)]">
          {applications.map(application => (
            <article key={application.id} id={`application-${application.id}`} className="grid gap-4 px-4 py-4 md:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{application.siteName}</h3>
                    <StatusBadge tone={application.status === 'pending' ? 'warning' : application.status === 'handled' ? 'success' : 'danger'}>
                      {getApplicationStatusLabel(application.status)}
                    </StatusBadge>
                  </div>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <span className="truncate">{application.authorName}</span>
                    <span className="text-muted/50">/</span>
                    <a href={application.siteUrl} target="_blank" rel="noreferrer" className="truncate underline-offset-4 hover:text-foreground hover:underline">
                      {application.siteUrl}
                    </a>
                    <span className="text-muted/50">/</span>
                    <span>{formatDate(application.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {application.status === 'pending' && (
                    <ApplicationStatusAction id={application.id} status="rejected" icon="i-lucide-x">
                      拒绝
                    </ApplicationStatusAction>
                  )}
                </div>
              </div>

              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-md border border-[var(--admin-border)] bg-background p-3">
                  <div className="mb-1 text-xs font-medium text-muted">简介</div>
                  <p className="leading-relaxed text-foreground">{application.description}</p>
                </div>
                <div className="rounded-md border border-[var(--admin-border)] bg-background p-3">
                  <div className="mb-1 text-xs font-medium text-muted">联系</div>
                  <p className="break-words leading-relaxed text-foreground">{application.contact}</p>
                </div>
                {(application.avatarUrl || application.feedUrl) && (
                  <div className="grid gap-2 rounded-md border border-[var(--admin-border)] bg-background p-3 text-xs md:col-span-2">
                    {application.avatarUrl && (
                      <div className="min-w-0">
                        <span className="text-muted">头像：</span>
                        <a href={application.avatarUrl} target="_blank" rel="noreferrer" className="break-all hover:text-foreground hover:underline">{application.avatarUrl}</a>
                      </div>
                    )}
                    {application.feedUrl && (
                      <div className="min-w-0">
                        <span className="text-muted">Feed：</span>
                        <a href={application.feedUrl} target="_blank" rel="noreferrer" className="break-all hover:text-foreground hover:underline">{application.feedUrl}</a>
                      </div>
                    )}
                  </div>
                )}
                {application.note && (
                  <div className="rounded-md border border-[var(--admin-border)] bg-background p-3 md:col-span-2">
                    <div className="mb-1 text-xs font-medium text-muted">备注</div>
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">{application.note}</p>
                  </div>
                )}
              </div>

              {application.status === 'pending' && (
                <ApplicationApprovalAction applicationId={application.id} groups={groups} />
              )}
            </article>
          ))}
        </div>
      )}
      <ApplicationSettingsForm enabled={applicationSettings.enabled} />
    </AdminPanel>
  )
}

export default async function AdminFriendsPage() {
  await requireAdminPage('/admin/friends')
  const [{ groups, links }, applicationSettings, applications] = await Promise.all([
    getAdminFriends(),
    getFriendApplicationSettings(),
    getAdminFriendApplications(),
  ])
  const feedLinks = links.filter(link => link.feedUrl && !link.feedMuted)

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="关系 / 友链与朋友圈"
        title="友链与朋友圈"
        description={`管理 ${links.length} 个友链源，其中 ${feedLinks.length} 个接入朋友圈 feed。`}
        actions={(
          <form action={refreshFriendFeeds}>
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-foreground bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
              <span className="i-lucide-refresh-cw text-base" />
              刷新朋友圈
            </button>
          </form>
        )}
      />
      <ApplicationInbox applications={applications} applicationSettings={applicationSettings} groups={groups} />
      <div className="grid gap-3 lg:grid-cols-2">
        <AdminCreatePanel title="新增友链" description="填写 Feed URL 后可进入朋友圈快照刷新。" icon="i-lucide-user-plus">
          <LinkForm groups={groups} />
        </AdminCreatePanel>
        <AdminCreatePanel title="新增分组" description="分组会用于 Links 页面分区和申请归类。" icon="i-lucide-folder-plus">
          <GroupForm />
        </AdminCreatePanel>
      </div>
      <div className="space-y-3">
        {groups.map(group => (
          <AdminPanel key={group.id}>
            <details>
              <AdminItemHeader
                title={group.name}
                status={group.status}
                meta={[group.slug, `${group.links.length} links`, `排序 ${group.sortOrder}`]}
              />
              <GroupForm group={group} />
              <div className="space-y-3 border-t border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3 md:p-4">
                {group.links.map(link => (
                  <AdminPanel key={link.id}>
                    <details>
                      <AdminItemHeader
                        title={link.sitenick || link.author}
                        status={link.status}
                        meta={[
                          link.linkUrl,
                          link.feedMuted ? '免打扰' : link.feedUrl ? `Feed ${link.lastCheckedAt ? formatTimeAgo(link.lastCheckedAt, true) : '未刷新'}` : '未接入 Feed',
                          link.lastError,
                        ]}
                        actions={(
                          <form action={deleteFriendLinkAction}>
                            <input type="hidden" name="id" value={link.id} />
                            <AdminDangerButton icon="i-lucide-trash-2">删除</AdminDangerButton>
                          </form>
                        )}
                      />
                      <LinkForm groups={groups} link={link} />
                    </details>
                  </AdminPanel>
                ))}
              </div>
            </details>
          </AdminPanel>
        ))}
        {groups.length === 0 && <AdminEmptyState icon="i-lucide-network" title="暂无友链分组" body="新增分组和友链后 Links 与 Friends 页面会读取后台数据。" />}
      </div>
    </section>
  )
}
