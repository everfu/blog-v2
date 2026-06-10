import { notFound } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
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
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">EDIT POST</span>
      </h2>
      <AdminNav />
      <PostEditor post={post} />
    </section>
  )
}
