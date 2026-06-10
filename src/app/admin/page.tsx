import AdminNav from '@/components/admin/AdminNav'
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

  const cards = [
    { label: 'Published', value: posts.published, icon: 'i-lucide-radio' },
    { label: 'Drafts', value: posts.draft, icon: 'i-lucide-file-pen-line' },
    { label: 'Comments', value: comments.approved + comments.pending + comments.spam, icon: 'i-lucide-message-square' },
    { label: 'Pending', value: comments.pending, icon: 'i-lucide-circle-alert' },
  ]

  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">ADMIN</span>
      </h2>
      <AdminNav />
      <div className="mx-4 mb-8 grid gap-4 md:mx-8 md:grid-cols-2">
        {cards.map(card => (
          <div key={card.label} className="border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted">{card.label}</span>
              <span className={`${card.icon} text-muted`} />
            </div>
            <div className="text-3xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-10 border border-border bg-card p-5 text-sm leading-relaxed text-muted md:mx-8">
        当前登录：{admin?.user_metadata?.user_name || admin?.email || 'Admin'}
      </div>
    </section>
  )
}
