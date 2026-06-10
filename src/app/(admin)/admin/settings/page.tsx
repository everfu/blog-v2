import { requireAdminPage } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdminPage('/admin/settings')

  return (
    <section className="space-y-5">
      <div className="border-b border-border pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Settings</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">站点设置</h2>
        <p className="mt-1 text-sm text-muted">后台扩展区，后续承载站点级策略。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['站点设置', '站点名称、描述、社交链接可以继续放在这里扩展。', 'i-lucide-settings-2'],
          ['评论策略', '审核规则、默认状态、屏蔽策略可以继续放在这里扩展。', 'i-lucide-message-square-more'],
          ['邮件通知', '评论提醒、发布通知和系统邮件可以继续放在这里扩展。', 'i-lucide-mail'],
          ['友链审核', '友链申请、分组和显示策略可以继续放在这里扩展。', 'i-lucide-users-round'],
        ].map(([title, body, icon]) => (
          <div key={title} className="border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <span className={`${icon} text-lg text-muted`} />
            </div>
            <p className="text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
