import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { getAdminPosts, getPostHref } from '@/features/posts'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage() {
  const posts = await getAdminPosts()

  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">POST ADMIN</span>
      </h2>
      <AdminNav />
      <div className="mx-4 mb-4 flex items-center justify-between md:mx-8">
        <p className="text-sm text-muted">{posts.length} posts</p>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm hover:border-foreground"
        >
          <span className="i-lucide-plus text-sm" />
          New
        </Link>
      </div>
      <div className="mx-4 mb-10 divide-y divide-border border border-border md:mx-8">
        {posts.map(post => (
          <article key={post.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{post.title}</span>
                <span className="border border-border px-2 py-0.5 text-[10px] uppercase text-muted">
                  {post.status}
                </span>
                {post.recent && (
                  <span className="border border-border px-2 py-0.5 text-[10px] uppercase text-muted">
                    recent
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted">
                {getPostHref(post)} · {formatDate(post.date)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {post.status === 'published' && (
                <Link href={getPostHref(post)} className="text-xs text-muted hover:text-foreground">
                  View
                </Link>
              )}
              <Link href={`/admin/posts/${post.id}`} className="text-xs text-muted hover:text-foreground">
                Edit
              </Link>
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No posts in Supabase yet.</div>
        )}
      </div>
    </section>
  )
}
