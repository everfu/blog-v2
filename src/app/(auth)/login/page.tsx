import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { signInWithGitHub } from './actions'

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
    return 'GitHub OAuth 凭据无效或已过期，请更新 Supabase Auth 里的 GitHub Client ID / Secret。'
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
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">管理员登录</h1>
            <p className="mt-2 text-sm text-muted">使用 GitHub 继续</p>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-5 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-500">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <span className="i-lucide-circle-alert text-base" />
                登录失败
              </div>
              {errorMessage}
            </div>
          )}

          <form action={signInWithGitHub}>
            <input type="hidden" name="next" value={redirectPath} />
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-foreground bg-foreground px-4 text-sm font-medium text-background shadow-sm hover:opacity-90"
            >
              <span className="i-lucide-github text-base" />
              使用 GitHub 登录
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
