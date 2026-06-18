import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
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

  if (error === 'profile-config') {
    return '缺少 Supabase service role key，无法同步管理员 profile。'
  }

  return '登录配置或授权失败，请检查 Supabase Auth 与环境变量。'
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ next = '/admin', error }, admin] = await Promise.all([
    searchParams,
    getCurrentAdmin(),
  ])
  const redirectPath = getAdminRedirectPath(next)
  const errorMessage = getLoginErrorMessage(error)

  if (admin) redirect(redirectPath)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-[360px]">
        <LoginClient nextPath={redirectPath} serverError={errorMessage} />
      </section>
    </main>
  )
}
