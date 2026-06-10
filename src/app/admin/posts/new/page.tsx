import AdminNav from '@/components/admin/AdminNav'
import PostEditor from '@/components/admin/PostEditor'
import { requireAdminPage } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  await requireAdminPage('/admin/posts/new')

  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">NEW POST</span>
      </h2>
      <AdminNav />
      <PostEditor />
    </section>
  )
}
