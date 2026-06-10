import { getPostCountByStatus } from '@/features/posts'
import { getCommentCountByStatus } from '@/features/comments'
import { requireAdminPage } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await requireAdminPage('/admin')
  const [posts, comments] = await Promise.all([
    getPostCountByStatus(),
    getCommentCountByStatus(),
  ])

  const totalComments = comments.approved + comments.pending + comments.spam
  const cards = [
    { label: 'Published', value: posts.published, icon: 'i-lucide-radio', hint: 'Live articles' },
    { label: 'Drafts', value: posts.draft, icon: 'i-lucide-file-pen-line', hint: 'Work in progress' },
    { label: 'Comments', value: totalComments, icon: 'i-lucide-message-square', hint: 'Visible queue' },
    { label: 'Pending', value: comments.pending, icon: 'i-lucide-circle-alert', hint: 'Needs review' },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">管理工作台</h2>
        </div>
        <p className="text-sm text-muted">
          当前登录：{admin.displayName || admin.githubUsername || admin.email || 'Admin'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="border border-border bg-card p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</span>
              <span className={`${card.icon} text-lg text-muted`} />
            </div>
            <div className="text-3xl font-semibold leading-none">{card.value}</div>
            <p className="mt-2 text-xs text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Content status</h3>
              <p className="text-sm text-muted">文章发布流的当前分布。</p>
            </div>
            <span className="i-lucide-bar-chart-3 text-lg text-muted" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Published', value: posts.published },
              { label: 'Draft', value: posts.draft },
              { label: 'Archived', value: posts.archived },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between border border-border bg-background px-4 py-3">
                <span className="text-sm text-muted">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Review queue</h3>
              <p className="text-sm text-muted">评论审核需要优先处理。</p>
            </div>
            <span className="i-lucide-inbox text-lg text-muted" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: comments.pending },
              { label: 'Approved', value: comments.approved },
              { label: 'Spam', value: comments.spam },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between border border-border bg-background px-4 py-3">
                <span className="text-sm text-muted">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
