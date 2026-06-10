import type { AdminPost } from '@/features/posts'
import { savePost } from '@/app/admin/actions'

interface PostEditorProps {
  post?: AdminPost | null
}

export default function PostEditor({ post }: PostEditorProps) {
  const year = post?.year || String(new Date().getFullYear())
  const fieldClass = 'w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground'
  const labelClass = 'space-y-2 text-xs font-medium text-muted'

  return (
    <form action={savePost} className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <input type="hidden" name="id" value={post?.id || ''} />

      <div className="space-y-5">
        <section className="border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">基础信息</h3>
            <p className="text-sm text-muted">标题、路径和归类会影响前台文章地址与列表展示。</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              Title
              <input name="title" required defaultValue={post?.title || ''} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Slug
              <input name="slug" required pattern="[a-z0-9-]+" defaultValue={post?.slug || ''} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Year
              <input name="year" required type="number" min="1970" max="3000" defaultValue={year} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Category
              <input name="category" defaultValue={post?.category || 'DAILY'} className={fieldClass} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Cover URL
              <input name="cover" type="url" defaultValue={post?.cover || ''} className={fieldClass} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Tags
              <input name="tags" defaultValue={post?.tags.join(', ') || ''} placeholder="nextjs, supabase" className={fieldClass} />
            </label>
          </div>
        </section>

        <section className="border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">正文</h3>
            <p className="text-sm text-muted">使用 MDX 编写文章内容。</p>
          </div>
          <label className={`${labelClass} block`}>
            Excerpt
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt || ''}
              className={`${fieldClass} leading-relaxed`}
            />
          </label>
          <label className={`${labelClass} mt-4 block`}>
            MDX Content
            <textarea
              name="content"
              required
              rows={24}
              defaultValue={post?.content || ''}
              className={`${fieldClass} min-h-[520px] font-mono leading-relaxed`}
            />
          </label>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <section className="border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">发布设置</h3>
              <p className="text-sm text-muted">保存后会按当前状态更新。</p>
            </div>
            <span className="i-lucide-send text-lg text-muted" />
          </div>
          <div className="space-y-4">
            <label className={`${labelClass} block`}>
              Status
              <select name="status" defaultValue={post?.status || 'draft'} className={fieldClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-3 border border-border bg-background px-3 py-2 text-sm text-muted">
              <span>Recent</span>
              <input type="checkbox" name="recent" defaultChecked={post?.recent || false} />
            </label>
          </div>
        </section>

        <section className="border border-border bg-card p-4 md:p-5">
          <h3 className="mb-3 text-base font-semibold text-foreground">路径预览</h3>
          <p className="break-all border border-border bg-background p-3 font-mono text-xs text-muted">
            /{year}/{post?.slug || 'post-slug'}
          </p>
        </section>

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 border border-foreground bg-foreground px-4 text-sm font-medium text-background hover:opacity-85"
        >
          <span className="i-lucide-save text-base" />
          Save post
        </button>
      </aside>
    </form>
  )
}
