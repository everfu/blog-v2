import PostEditor from '@/components/admin/PostEditor'
import { requireAdminPage } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  await requireAdminPage('/admin/posts/new')

  return (
    <section className="space-y-5">
      <div className="border-b border-border pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Posts</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">新建文章</h2>
        <p className="mt-1 text-sm text-muted">创建一篇新的 MDX 内容。</p>
      </div>
      <PostEditor />
    </section>
  )
}
