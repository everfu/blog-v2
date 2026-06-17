import type { AdminPost, PostRevisionSummary } from '@/server/posts/contracts/types'
import { savePost } from '@/app/admin/actions'
import { AdminSubmitButton } from './AdminPrimitives'
import {
  PostBasicInfoSection,
  PostContentSection,
  PostMetadataSection,
  PostPathPreviewSection,
  PostPublishSettingsSection,
  PostRevisionsSection,
} from './PostEditorSections'

interface PostEditorProps {
  post?: AdminPost | null
  revisions?: PostRevisionSummary[]
}

export default function PostEditor({ post, revisions = [] }: PostEditorProps) {
  const fieldClass = 'w-full rounded-md border border-[var(--admin-border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[var(--admin-border-strong)]'
  const labelClass = 'space-y-2 text-xs font-medium text-muted'

  return (
    <form action={savePost} className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <input type="hidden" name="id" value={post?.id || ''} />

      <div className="space-y-5">
        <PostBasicInfoSection post={post} fieldClass={fieldClass} labelClass={labelClass} />
        <PostContentSection post={post} fieldClass={fieldClass} labelClass={labelClass} />
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <PostPublishSettingsSection post={post} fieldClass={fieldClass} labelClass={labelClass} />
        <PostPathPreviewSection post={post} />

        {post && (
          <PostMetadataSection post={post} />
        )}

        {post && (
          <PostRevisionsSection revisions={revisions} />
        )}

        <AdminSubmitButton icon="i-lucide-save" className="w-full">
          保存文章
        </AdminSubmitButton>
      </aside>
    </form>
  )
}
