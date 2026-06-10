import AdminNav from '@/components/admin/AdminNav'
import { updateCommentStatus } from '@/app/admin/actions'
import { getAdminComments } from '@/features/comments'
import { requireAdminPage } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  await requireAdminPage('/admin/comments')
  const comments = await getAdminComments()

  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">COMMENT ADMIN</span>
      </h2>
      <AdminNav />
      <div className="mx-4 mb-10 divide-y divide-border border border-border md:mx-8">
        {comments.map(comment => (
          <article key={comment.id} className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">{comment.authorName}</div>
                <div className="mt-1 text-xs text-muted">
                  {comment.pagePath} · {new Date(comment.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <span className="border border-border px-2 py-0.5 text-[10px] uppercase text-muted">
                {comment.status}
              </span>
            </div>
            <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
              {comment.body}
            </p>
            <div className="flex flex-wrap gap-2">
              {(['approved', 'pending', 'spam', 'deleted'] as const).map(status => (
                <form key={status} action={updateCommentStatus}>
                  <input type="hidden" name="id" value={comment.id} />
                  <input type="hidden" name="status" value={status} />
                  <button
                    type="submit"
                    disabled={comment.status === status}
                    className="border border-border px-2 py-1 text-xs text-muted hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status}
                  </button>
                </form>
              ))}
            </div>
          </article>
        ))}
        {comments.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No comments yet.</div>
        )}
      </div>
    </section>
  )
}
