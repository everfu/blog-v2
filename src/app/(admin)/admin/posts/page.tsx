import Link from 'next/link'
import { getAdminPosts, getPostHref } from '@/features/posts'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage() {
  await requireAdminPage('/admin/posts')
  const posts = await getAdminPosts()

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Posts</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">文章管理</h2>
          <p className="mt-1 text-sm text-muted">{posts.length} posts in Supabase</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-card px-4 text-sm font-medium hover:border-foreground"
        >
          <span className="i-lucide-plus text-base" />
          New post
        </Link>
      </div>

      <div className="overflow-hidden border border-border bg-card">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted md:grid-cols-[1fr_150px_120px_120px]">
          <span>Title</span>
          <span className="hidden md:block">Status</span>
          <span className="hidden md:block">Date</span>
          <span className="text-right">Actions</span>
        </div>
        {posts.map(post => (
          <article key={post.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[1fr_150px_120px_120px]">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{post.title}</span>
                <span className="border border-border bg-background px-2 py-0.5 text-[10px] uppercase text-muted md:hidden">
                  {post.status}
                </span>
                {post.recent && (
                  <span className="border border-border bg-background px-2 py-0.5 text-[10px] uppercase text-muted">
                    recent
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted">
                {getPostHref(post)}
              </p>
            </div>
            <span className="hidden w-fit border border-border bg-background px-2 py-1 text-[11px] uppercase text-muted md:inline-flex">
              {post.status}
            </span>
            <span className="hidden text-sm text-muted md:block">{formatDate(post.date)}</span>
            <div className="flex items-center justify-end gap-2">
              {post.status === 'published' && (
                <Link
                  href={getPostHref(post)}
                  className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted hover:border-foreground hover:text-foreground"
                  title="View"
                  aria-label={`View ${post.title}`}
                >
                  <span className="i-lucide-eye text-sm" />
                </Link>
              )}
              <Link
                href={`/admin/posts/${post.id}`}
                className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted hover:border-foreground hover:text-foreground"
                title="Edit"
                aria-label={`Edit ${post.title}`}
              >
                <span className="i-lucide-pencil text-sm" />
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
