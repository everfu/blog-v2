import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { signInWithGitHub } from './actions'
import LoginClient from './LoginClient'

interface LoginPageProps {
  searchParams: Promise<{
    next?: string
    error?: string
    error_code?: string
    error_description?: string
  }>
}

export const dynamic = 'force-dynamic'

function getLoginErrorMessage(
  error: string | undefined,
  errorCode: string | undefined,
  errorDescription: string | undefined
) {
  if (!error) return null

  if (
    error === 'provider' &&
    errorCode === 'unexpected_failure' &&
    errorDescription === 'Error getting user profile from external provider'
  ) {
    return '迁移登录凭据无效或已过期，请更新 Supabase Auth 里的 GitHub Client ID / Secret。'
  }

  if (error === 'profile-config') {
    return '缺少 Supabase service role key，无法同步管理员 profile。'
  }

  if (errorDescription) return errorDescription

  return '登录配置或授权失败，请检查 Supabase Auth 与环境变量。'
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ next = '/admin', error, error_code, error_description }, admin] = await Promise.all([
    searchParams,
    getCurrentAdmin(),
  ])
  const redirectPath = getAdminRedirectPath(next)
  const errorMessage = getLoginErrorMessage(error, error_code, error_description)

  if (admin) redirect(redirectPath)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-[360px]">
        <LoginClient nextPath={redirectPath} serverError={errorMessage} />
        <div className="mt-4 rounded-lg border border-dashed border-border bg-card/70 p-4">
          <div className="mb-3 text-xs leading-relaxed text-muted">
            迁移期间可继续使用 GitHub 登录，进入后台后请在账号安全页注册通行密钥。
          </div>
          <form action={signInWithGitHub}>
            <input type="hidden" name="next" value={redirectPath} />
            <button
              type="submit"
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground shadow-sm hover:bg-muted"
            >
              <span className="i-lucide-github text-sm" />
              使用 GitHub 迁移登录
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
