import type { AdminPost, PostRevisionSummary } from '@/server/posts/contracts/types'
import { formatDate, formatTimeAgo } from '@/lib/utils'
import { AdminEmptyState, AdminPanel, AdminPanelHeader, AdminSelect, StatusBadge, getPostStatusLabel, getStatusTone } from './AdminPrimitives'
import AdminMediaHint from './AdminMediaHint'

interface SectionProps {
  post?: AdminPost | null
  fieldClass: string
  labelClass: string
}

export function PostBasicInfoSection({ post, fieldClass, labelClass }: SectionProps) {
  const year = post?.year || String(new Date().getFullYear())

  return (
    <AdminPanel>
      <AdminPanelHeader title="基础信息" description="标题、路径和归类会影响前台文章地址与列表展示。" />
      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
        <label className={labelClass}>
          标题
          <input name="title" required defaultValue={post?.title || ''} className={fieldClass} />
        </label>
        <label className={labelClass}>
          路径标识
          <input name="slug" required pattern="[a-z0-9-]+" defaultValue={post?.slug || ''} className={fieldClass} />
        </label>
        <label className={labelClass}>
          年份
          <input name="year" required type="number" min="1970" max="3000" defaultValue={year} className={fieldClass} />
        </label>
        <label className={labelClass}>
          分类
          <input name="category" defaultValue={post?.category || 'DAILY'} className={fieldClass} />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          <span className="flex items-center justify-between gap-2">
            <span>封面地址</span>
            <AdminMediaHint folder="posts" />
          </span>
          <input name="cover" type="url" defaultValue={post?.cover || ''} className={fieldClass} />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          标签
          <input name="tags" defaultValue={post?.tags.join(', ') || ''} placeholder="nextjs, supabase，用英文逗号分隔" className={fieldClass} />
        </label>
      </div>
    </AdminPanel>
  )
}

export function PostContentSection({ post, fieldClass, labelClass }: SectionProps) {
  return (
    <AdminPanel>
      <AdminPanelHeader title="正文" description="使用 MDX 编写文章内容。" />
      <div className="p-4 md:p-5">
        <label className={`${labelClass} block`}>
          摘要
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt || ''}
            className={`${fieldClass} leading-relaxed`}
          />
        </label>
        <label className={`${labelClass} mt-4 block`}>
          MDX 正文
          <textarea
            name="content"
            required
            rows={24}
            defaultValue={post?.content || ''}
            className={`${fieldClass} min-h-[520px] font-mono leading-relaxed`}
          />
        </label>
      </div>
    </AdminPanel>
  )
}

export function PostPublishSettingsSection({ post, fieldClass, labelClass }: SectionProps) {
  return (
    <AdminPanel>
      <AdminPanelHeader title="发布设置" description="保存后会按当前状态更新。" icon="i-lucide-send" />
      <div className="space-y-4 p-4 md:p-5">
        <label className={`${labelClass} block`}>
          状态
          <AdminSelect name="status" defaultValue={post?.status || 'draft'} className={fieldClass}>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </AdminSelect>
        </label>
        <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--admin-border)] bg-background px-3 py-2 text-sm text-muted">
          <span>近期推荐</span>
          <input type="checkbox" name="recent" defaultChecked={post?.recent || false} />
        </label>
        <StatusBadge tone={getStatusTone(post?.status || 'draft')}>
          {getPostStatusLabel(post?.status || 'draft')}
        </StatusBadge>
      </div>
    </AdminPanel>
  )
}

export function PostPathPreviewSection({ post }: { post?: AdminPost | null }) {
  const year = post?.year || String(new Date().getFullYear())

  return (
    <AdminPanel>
      <AdminPanelHeader title="路径预览" />
      <div className="p-4 md:p-5">
        <p className="break-all rounded-md border border-[var(--admin-border)] bg-background p-3 font-mono text-xs text-muted">
          /{year}/{post?.slug || 'post-slug'}
        </p>
      </div>
    </AdminPanel>
  )
}

export function PostMetadataSection({ post }: { post: AdminPost }) {
  const items = [
    { label: '发布时间', value: formatDate(post.date) },
    { label: '最近更新', value: formatTimeAgo(post.updatedAt, true) },
    { label: '浏览量', value: post.viewCount },
    { label: '点赞数', value: post.likeCount },
    { label: '标签数量', value: post.tags.length },
  ]

  return (
    <AdminPanel>
      <AdminPanelHeader title="内容元信息" icon="i-lucide-info" />
      <div className="space-y-3 p-4 text-sm md:p-5">
        {items.map(item => (
          <div key={item.label} className="flex justify-between gap-3">
            <span className="text-muted">{item.label}</span>
            <span className="text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </AdminPanel>
  )
}

export function PostRevisionsSection({ revisions }: { revisions: PostRevisionSummary[] }) {
  return (
    <AdminPanel>
      <AdminPanelHeader title="版本记录" description="展示最近保存的快照，不提供回滚操作。" icon="i-lucide-history" />
      <div className="space-y-3 p-4 md:p-5">
        {revisions.map(revision => (
          <div key={revision.id} className="rounded-md border border-[var(--admin-border)] bg-background p-3">
            <div className="text-sm font-medium text-foreground">{formatTimeAgo(revision.createdAt, true)}</div>
            <div className="mt-1 truncate text-xs text-muted">
              保存人：{revision.createdBy || '未知管理员'}
            </div>
          </div>
        ))}
        {revisions.length === 0 && (
          <AdminEmptyState icon="i-lucide-history" title="暂无版本记录" body="首次编辑保存后会记录文章快照。" />
        )}
      </div>
    </AdminPanel>
  )
}
