import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { getAdminPasskeyState } from '@/server/auth/application/profile'
import LoginClient from './LoginClient'

interface LoginPageProps {
  searchParams: Promise<{
    next?: string
    error?: string
  }>
}

export const dynamic = 'force-dynamic'

function getLoginErrorMessage(error: string | undefined) {
  if (!error) return null

  if (error === 'missing-config') {
    return '缺少 Supabase 配置，无法登录。'
  }

  if (error === 'admin-email') {
    return '未配置 ADMIN_EMAIL，无法确定管理员账号。'
  }

  return '登录配置或授权失败，请检查 Supabase 与环境变量。'
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ next = '/admin', error }, admin, passkeyState] = await Promise.all([
    searchParams,
    getCurrentAdmin(),
    getAdminPasskeyState(),
  ])
  const redirectPath = getAdminRedirectPath(next)
  const errorMessage = getLoginErrorMessage(error)

  if (admin) redirect(redirectPath)

  // Bootstrap is only offered while the admin account has zero passkeys.
  const canBootstrap = passkeyState.ok && passkeyState.state.passkeyCount === 0

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-[360px]">
        <LoginClient
          nextPath={redirectPath}
          serverError={errorMessage}
          canBootstrap={canBootstrap}
        />
      </section>
    </main>
  )
}
