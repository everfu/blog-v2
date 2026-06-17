import { requireAdminPage } from '@/lib/auth/require-admin'
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from '@/components/admin/AdminPrimitives'
import AdminPasskeyManager from '@/components/admin/AdminPasskeyManager'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdminPage('/admin/settings')

  return (
    <>
      <AdminPageHeader
        eyebrow="后台 / 系统管理 / 账号安全"
        title="账号安全"
      />

      <AdminPanel>
        <AdminPanelHeader
          title="登录凭据"
          description="管理当前管理员账号可用于登录后台的通行密钥。"
          icon="i-lucide-shield-check"
        />
        <AdminPasskeyManager />
      </AdminPanel>
    </>
  )
}
