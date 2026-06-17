import { notFound } from 'next/navigation'
import PostEditor from '@/components/admin/PostEditor'
import { getAdminPostById, getPostRevisions } from '@/server/posts/adapters/admin'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  await requireAdminPage(`/admin/posts/${id}`)
  const [post, revisions] = await Promise.all([
    getAdminPostById(id),
    getPostRevisions(id, 5),
  ])

  if (!post) notFound()

  return (
    <section className="space-y-5">
      <AdminPageHeader eyebrow="内容 / 文章管理" title="编辑文章" description={post.title} />
      <PostEditor post={post} revisions={revisions} />
    </section>
  )
}
