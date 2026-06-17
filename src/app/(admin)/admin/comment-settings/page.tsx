import { requireAdminPage } from '@/lib/auth/require-admin'
import { formatEmojiPackSources, getCommentAvatarSettings, getCommentSmtpSettings, getEmojiPackSources } from '@/server/comments/adapters/settings'
import { saveCommentAvatarSettings, saveCommentEmojiPacks, saveCommentSmtpSettings, sendCommentSmtpTestAction } from '@/app/admin/actions'
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from '@/components/admin/AdminPrimitives'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    saved?: string
    error?: string
  }>
}

function getNotice(saved?: string, error?: string) {
  if (saved === 'emoji-packs') return { tone: 'success', text: '表情包设置已保存。' }
  if (saved === 'avatar-provider') return { tone: 'success', text: '头像设置已保存。' }
  if (saved === 'smtp') return { tone: 'success', text: 'SMTP 设置已保存。' }
  if (saved === 'smtp-test') return { tone: 'success', text: '测试邮件已发送。' }
  if (error === 'emoji-sources') return { tone: 'error', text: '表情包链接格式不正确，请每行填写一个 http(s) JSON 地址。' }
  if (error === 'emoji-save') return { tone: 'error', text: '表情包保存失败。' }
  if (error === 'avatar-save') return { tone: 'error', text: '头像设置保存失败。' }
  if (error === 'smtp-save') return { tone: 'error', text: 'SMTP 设置保存失败。' }
  if (error === 'smtp-test') return { tone: 'error', text: '测试邮件发送失败，请检查 SMTP 配置。' }
  if (error === 'smtp-test-email') return { tone: 'error', text: '请输入测试收件邮箱。' }
  return null
}

export default async function AdminCommentSettingsPage({ searchParams }: PageProps) {
  await requireAdminPage('/admin/comment-settings')
  const params = await searchParams
  const [avatarSettings, emojiPackSources, smtpSettings] = await Promise.all([
    getCommentAvatarSettings(),
    getEmojiPackSources(),
    getCommentSmtpSettings(),
  ])
  const notice = getNotice(params.saved, params.error)

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="互动运营 / 设置"
        title="评论设置"
        description="配置评论头像、表情包和邮件提醒。"
      />

      {notice && (
        <div className={`rounded-md border px-4 py-3 text-sm ${notice.tone === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
          {notice.text}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <AdminPanel>
          <AdminPanelHeader title="头像" description="默认使用 WeAvatar 邮箱 Hash 头像。" icon="i-lucide-user-circle" />
          <form action={saveCommentAvatarSettings} className="grid gap-4 p-4 md:p-5">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" name="enabled" defaultChecked={avatarSettings.enabled} className="h-4 w-4 rounded border-[var(--admin-border)]" />
              启用评论头像
            </label>
            <div className="rounded-md border border-[var(--admin-border)] bg-background px-3 py-2 text-xs text-muted">
              https://weavatar.com/avatar/HASH
            </div>
            <button type="submit" className="inline-flex h-9 items-center justify-center gap-2 justify-self-start rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
              <span className="i-lucide-save text-sm" />
              保存头像设置
            </button>
          </form>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="SMTP 邮件" description="用于新评论提醒和回复提醒。" icon="i-lucide-mail" />
          <form action={saveCommentSmtpSettings} className="grid gap-4 p-4 md:p-5">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" name="enabled" defaultChecked={smtpSettings.enabled} className="h-4 w-4 rounded border-[var(--admin-border)]" />
              启用邮件提醒
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1.5 text-xs font-medium text-muted">
                SMTP Host
                <input name="host" defaultValue={smtpSettings.host} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-muted">
                Port
                <input name="port" type="number" min="1" max="65535" defaultValue={smtpSettings.port} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-muted">
                Username
                <input name="username" defaultValue={smtpSettings.username} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-muted">
                Password
                <input name="password" type="password" defaultValue={smtpSettings.password} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-muted">
                From Name
                <input name="fromName" defaultValue={smtpSettings.fromName} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-muted">
                From Email
                <input name="fromEmail" type="email" defaultValue={smtpSettings.fromEmail} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-muted md:col-span-2">
                站长收件邮箱
                <input name="ownerEmail" type="email" defaultValue={smtpSettings.ownerEmail} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" name="secure" defaultChecked={smtpSettings.secure} className="h-4 w-4 rounded border-[var(--admin-border)]" />
              使用 SSL/TLS
            </label>
            <button type="submit" className="inline-flex h-9 items-center justify-center gap-2 justify-self-start rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
              <span className="i-lucide-save text-sm" />
              保存 SMTP
            </button>
          </form>

          <form action={sendCommentSmtpTestAction} className="grid gap-3 border-t border-[var(--admin-border)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:p-5">
            <label className="space-y-1.5 text-xs font-medium text-muted">
              测试收件邮箱
              <input name="to" type="email" defaultValue={smtpSettings.ownerEmail} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm text-foreground outline-none focus:border-[var(--admin-border-strong)]" />
            </label>
            <button type="submit" className="inline-flex h-9 items-center justify-center gap-2 self-end rounded-md border border-[var(--admin-border)] bg-background px-4 text-sm font-medium text-foreground hover:border-[var(--admin-border-strong)]">
              <span className="i-lucide-send text-sm" />
              发送测试
            </button>
          </form>
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminPanelHeader title="表情包" description="填写 OWO JSON 文件地址，多个地址每行一个。" icon="i-lucide-smile" />
        <form action={saveCommentEmojiPacks} className="grid gap-4 p-4 md:p-5">
          <textarea
            name="emojiPacks"
            defaultValue={formatEmojiPackSources(emojiPackSources)}
            spellCheck={false}
            className="min-h-24 rounded-md border border-[var(--admin-border)] bg-background p-3 font-mono text-xs leading-relaxed text-foreground outline-none focus:border-[var(--admin-border-strong)]"
          />
          <div className="rounded-md border border-[var(--admin-border)] bg-background px-3 py-2 text-xs text-muted">
            默认：https://owo.imaegoo.com/owo.json
          </div>
          <button type="submit" className="inline-flex h-9 items-center justify-center gap-2 justify-self-start rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
            <span className="i-lucide-save text-sm" />
            保存表情包
          </button>
        </form>
      </AdminPanel>
    </section>
  )
}
