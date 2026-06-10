import AdminNav from '@/components/admin/AdminNav'
import { requireAdminPage } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdminPage('/admin/settings')

  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">SETTINGS</span>
      </h2>
      <AdminNav />
      <div className="mx-4 mb-10 border border-border bg-card p-5 text-sm leading-relaxed text-muted md:mx-8">
        站点设置、评论策略、邮件通知和友链审核可以继续放在这里扩展。
      </div>
    </section>
  )
}
