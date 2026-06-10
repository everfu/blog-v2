import type { AdminPost } from '@/features/posts'
import { savePost } from '@/app/admin/actions'

interface PostEditorProps {
  post?: AdminPost | null
}

export default function PostEditor({ post }: PostEditorProps) {
  const year = post?.year || String(new Date().getFullYear())

  return (
    <form action={savePost} className="mx-4 my-6 space-y-4 md:mx-8">
      <input type="hidden" name="id" value={post?.id || ''} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-xs text-muted">
          Title
          <input
            name="title"
            required
            defaultValue={post?.title || ''}
            className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
          />
        </label>
        <label className="space-y-2 text-xs text-muted">
          Slug
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={post?.slug || ''}
            className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
          />
        </label>
        <label className="space-y-2 text-xs text-muted">
          Year
          <input
            name="year"
            required
            type="number"
            min="1970"
            max="3000"
            defaultValue={year}
            className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
          />
        </label>
        <label className="space-y-2 text-xs text-muted">
          Category
          <input
            name="category"
            defaultValue={post?.category || 'DAILY'}
            className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
          />
        </label>
        <label className="space-y-2 text-xs text-muted md:col-span-2">
          Cover URL
          <input
            name="cover"
            type="url"
            defaultValue={post?.cover || ''}
            className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
          />
        </label>
        <label className="space-y-2 text-xs text-muted md:col-span-2">
          Tags
          <input
            name="tags"
            defaultValue={post?.tags.join(', ') || ''}
            placeholder="nextjs, supabase"
            className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
          />
        </label>
      </div>

      <label className="block space-y-2 text-xs text-muted">
        Excerpt
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={post?.excerpt || ''}
          className="w-full border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-foreground"
        />
      </label>

      <label className="block space-y-2 text-xs text-muted">
        MDX Content
        <textarea
          name="content"
          required
          rows={18}
          defaultValue={post?.content || ''}
          className="w-full border border-border bg-background px-3 py-2 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-foreground"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="recent" defaultChecked={post?.recent || false} />
            Recent
          </label>
          <select
            name="status"
            defaultValue={post?.status || 'draft'}
            className="border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:border-foreground"
        >
          <span className="i-lucide-save text-sm" />
          Save
        </button>
      </div>
    </form>
  )
}
