import PostEditor from '@/components/admin/PostEditor'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  await requireAdminPage('/admin/posts/new')

  return (
    <section className="space-y-5">
      <AdminPageHeader eyebrow="内容 / 文章管理" title="新建文章" description="创建一篇新的 MDX 内容。" />
      <PostEditor />
    </section>
  )
}
