import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { signInWithGitHub } from './actions'

interface LoginPageProps {
  searchParams: Promise<{
    next?: string
    error?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ next = '/admin', error }, admin] = await Promise.all([
    searchParams,
    getCurrentAdmin(),
  ])

  if (admin) redirect(next)

  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">LOGIN</span>
      </h2>
      <div className="mx-4 my-10 md:mx-8">
        <div className="border border-border bg-card p-6">
          <h1 className="mb-3 text-xl font-semibold">管理员登录</h1>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            使用 GitHub 登录后，只有白名单账号可以进入后台。
          </p>
          {error && (
            <p className="mb-4 border-l border-red-400 pl-3 text-sm text-red-400">
              登录配置或授权失败，请检查 Supabase Auth 与环境变量。
            </p>
          )}
          <form action={signInWithGitHub}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:border-foreground"
            >
              <span className="i-lucide-github text-base" />
              使用 GitHub 登录
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
