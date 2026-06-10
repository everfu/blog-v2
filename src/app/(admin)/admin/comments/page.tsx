import { updateCommentStatus } from '@/app/admin/actions'
import { getAdminComments } from '@/features/comments'
import { requireAdminPage } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  await requireAdminPage('/admin/comments')
  const comments = await getAdminComments()

  return (
    <section className="space-y-5">
      <div className="border-b border-border pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Comments</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">评论审核</h2>
        <p className="mt-1 text-sm text-muted">{comments.length} comments in the moderation queue</p>
      </div>

      <div className="space-y-3">
        {comments.map(comment => (
          <article key={comment.id} className="border border-border bg-card p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{comment.authorName}</div>
                <div className="mt-1 text-xs text-muted">
                  {comment.pagePath} · {new Date(comment.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <span className="border border-border bg-background px-2 py-1 text-[10px] uppercase text-muted">
                {comment.status}
              </span>
            </div>
            <p className="mb-4 whitespace-pre-wrap break-words border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
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
                    className="h-8 border border-border px-3 text-xs text-muted hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status}
                  </button>
                </form>
              ))}
            </div>
          </article>
        ))}
        {comments.length === 0 && (
          <div className="border border-border bg-card p-10 text-center text-sm text-muted">No comments yet.</div>
        )}
      </div>
    </section>
  )
}
