import { deleteWatched, saveWatched } from '@/app/admin/actions'
import { getAdminWatchedItems } from '@/server/content/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import {
  AdminCreatePanel,
  AdminDangerButton,
  AdminEmptyState,
  AdminField,
  AdminFileInput,
  AdminFormActions,
  AdminFormGrid,
  AdminInput,
  AdminItemHeader,
  AdminPageHeader,
  AdminPanel,
  AdminSelect,
  AdminSubmitButton,
} from '@/components/admin/AdminPrimitives'
import AdminMediaHint from '@/components/admin/AdminMediaHint'

export const dynamic = 'force-dynamic'

function WatchedForm({ item }: { item?: Awaited<ReturnType<typeof getAdminWatchedItems>>[number] }) {
  return (
    <form action={saveWatched}>
      <input type="hidden" name="id" value={item?.id || ''} />
      <AdminFormGrid columns={4}>
        <AdminField label="标题" span={2}>
          <AdminInput name="title" defaultValue={item?.title} required />
        </AdminField>
        <AdminField label="评分">
          <AdminInput name="rating" type="number" min="0" max="10" step="0.1" defaultValue={item?.rating || 8} required />
        </AdminField>
        <AdminField label="年份">
          <AdminInput name="year" defaultValue={item?.year || new Date().getFullYear()} required />
        </AdminField>
        <AdminField label="观看日期">
          <AdminInput name="watchedAt" type="date" defaultValue={item?.date || new Date().toISOString().slice(0, 10)} required />
        </AdminField>
        <AdminField label="状态">
          <AdminSelect name="status" defaultValue={item?.status || 'published'}>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">归档</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={item?.sortOrder || 0} />
        </AdminField>
        <AdminField label="国家/地区">
          <AdminInput name="country" defaultValue={item?.country} />
        </AdminField>
        <AdminField label="类型">
          <AdminInput name="genre" defaultValue={item?.genre} />
        </AdminField>
        <AdminField label="导演/演员" span={2}>
          <AdminInput name="director" defaultValue={item?.director} />
        </AdminField>
        <AdminField label="图片 URL" span={2} hint={<AdminMediaHint folder="watched" />}>
          <AdminInput name="imageUrl" defaultValue={item?.imageUrl} />
        </AdminField>
        <AdminField label="上传图片" span={2}>
          <AdminFileInput name="imageFile" accept="image/*" />
        </AdminField>
      </AdminFormGrid>
      <AdminFormActions>
        <AdminSubmitButton icon="i-lucide-save">{item ? '保存电影' : '新增电影'}</AdminSubmitButton>
      </AdminFormActions>
    </form>
  )
}

export default async function AdminWatchedPage() {
  await requireAdminPage('/admin/watched')
  const items = await getAdminWatchedItems()

  return (
    <section className="space-y-6">
      <AdminPageHeader eyebrow="内容 / 电影推荐" title="电影推荐" description={`管理首页 Recently Watched，共 ${items.length} 条。`} />
      <AdminCreatePanel title="新增电影" description="保存后会刷新首页 watched 缓存。" icon="i-lucide-plus">
        <WatchedForm />
      </AdminCreatePanel>
      <div className="space-y-3">
        {items.map(item => (
          <AdminPanel key={item.id}>
            <details>
              <AdminItemHeader
                title={item.title}
                status={item.status}
                meta={[item.date, item.rating, item.genre, item.country, `排序 ${item.sortOrder}`]}
                actions={(
                <form action={deleteWatched}>
                  <input type="hidden" name="id" value={item.id} />
                    <AdminDangerButton icon="i-lucide-trash-2">删除</AdminDangerButton>
                </form>
                )}
              />
              <WatchedForm item={item} />
            </details>
          </AdminPanel>
        ))}
        {items.length === 0 && <AdminEmptyState icon="i-lucide-film" title="暂无电影" body="添加第一条推荐后会出现在首页。" />}
      </div>
    </section>
  )
}
