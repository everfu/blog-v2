import { notFound } from 'next/navigation'
import PostEditor from '@/components/admin/PostEditor'
import { getAdminPostById } from '@/features/posts'
import { requireAdminPage } from '@/lib/auth/require-admin'

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  await requireAdminPage(`/admin/posts/${id}`)
  const post = await getAdminPostById(id)

  if (!post) notFound()

  return (
    <section className="space-y-5">
      <div className="border-b border-border pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Posts</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">编辑文章</h2>
        <p className="mt-1 truncate text-sm text-muted">{post.title}</p>
      </div>
      <PostEditor post={post} />
    </section>
  )
}
