import { getAdminPosts } from '@/server/posts/adapters/admin'
import { requireAdminPage } from '@/lib/auth/require-admin'
import {
  AdminPageHeader,
  AdminButtonLink,
} from '@/components/admin/AdminPrimitives'
import AdminPostsFilters from '@/components/admin/AdminPostsFilters'
import AdminPostsList from '@/components/admin/AdminPostsList'
import AdminPostsOverview from '@/components/admin/AdminPostsOverview'
import type { PostStatus } from '@/types/supabase'

export const dynamic = 'force-dynamic'

interface AdminPostsPageProps {
  searchParams: Promise<{
    status?: string
    keyword?: string
    year?: string
    category?: string
    recent?: string
  }>
}

function isPostStatus(value?: string): value is PostStatus {
  return value === 'draft' || value === 'published' || value === 'archived'
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  await requireAdminPage('/admin/posts')
  const params = await searchParams
  const status = isPostStatus(params.status) ? params.status : params.status === 'all' ? 'all' : undefined
  const posts = await getAdminPosts({
    status,
    keyword: params.keyword,
    year: params.year,
    category: params.category,
    recent: params.recent === '1',
  })

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="内容 / 文章管理"
        title="文章管理"
        description={`管理发布内容，共 ${posts.length} 篇，累计 ${posts.reduce((sum, post) => sum + post.viewCount, 0)} 次浏览。`}
        actions={(
          <AdminButtonLink href="/admin/posts/new" icon="i-lucide-plus" variant="primary">
            新建文章
          </AdminButtonLink>
        )}
      />

      <AdminPostsFilters params={params} summary={<AdminPostsOverview posts={posts} />} />
      <AdminPostsList posts={posts} />
    </section>
  )
}
