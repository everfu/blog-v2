import { deleteAlbumPhotoAction, saveAlbumCategoryAction, saveAlbumPhotoAction } from '@/app/admin/actions'
import { getAdminAlbum } from '@/server/album/adapters/page'
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
  AdminTextarea,
} from '@/components/admin/AdminPrimitives'
import AdminMediaHint from '@/components/admin/AdminMediaHint'

export const dynamic = 'force-dynamic'

function CategoryForm({ category }: { category?: Awaited<ReturnType<typeof getAdminAlbum>>['categories'][number] }) {
  return (
    <form action={saveAlbumCategoryAction}>
      <input type="hidden" name="id" value={category?.id || ''} />
      <AdminFormGrid columns={4}>
        <AdminField label="Slug">
          <AdminInput name="slug" defaultValue={category?.slug} required />
        </AdminField>
        <AdminField label="标签">
          <AdminInput name="label" defaultValue={category?.label} required />
        </AdminField>
        <AdminField label="状态">
          <AdminSelect name="status" defaultValue={category?.status || 'published'}>
            <option value="published">已发布</option><option value="draft">草稿</option><option value="archived">归档</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={category?.sortOrder || 0} />
        </AdminField>
        <AdminField label="封面 URL" span={2} hint={<AdminMediaHint folder="album" />}>
          <AdminInput name="coverImageUrl" defaultValue={category?.coverImageUrl} />
        </AdminField>
        <AdminField label="上传封面" span={2}>
          <AdminFileInput name="coverImageFile" accept="image/*" />
        </AdminField>
        <AdminField label="描述" span="full">
          <AdminTextarea name="description" defaultValue={category?.description} />
        </AdminField>
      </AdminFormGrid>
      <AdminFormActions><AdminSubmitButton icon="i-lucide-save">{category ? '保存分类' : '新增分类'}</AdminSubmitButton></AdminFormActions>
    </form>
  )
}

function PhotoForm({
  categories,
  photo,
}: {
  categories: Awaited<ReturnType<typeof getAdminAlbum>>['categories']
  photo?: Awaited<ReturnType<typeof getAdminAlbum>>['photos'][number]
}) {
  return (
    <form action={saveAlbumPhotoAction}>
      <input type="hidden" name="id" value={photo?.id || ''} />
      <AdminFormGrid columns={4}>
        <AdminField label="分类">
          <AdminSelect name="categoryId" defaultValue={photo?.categoryId || categories[0]?.id} required>
            {categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
          </AdminSelect>
        </AdminField>
        <AdminField label="标题">
          <AdminInput name="label" defaultValue={photo?.label} />
        </AdminField>
        <AdminField label="日期">
          <AdminInput name="takenAt" type="date" defaultValue={photo?.takenAt} />
        </AdminField>
        <AdminField label="状态">
          <AdminSelect name="status" defaultValue={photo?.status || 'published'}>
            <option value="published">已发布</option><option value="draft">草稿</option><option value="archived">归档</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={photo?.sortOrder || 0} />
        </AdminField>
        <AdminField label="上传图片">
          <AdminFileInput name="imageFile" accept="image/*" />
        </AdminField>
        <AdminField label="图片 URL" span={2} hint={<AdminMediaHint folder="album" />}>
          <AdminInput name="imageUrl" defaultValue={photo?.imageUrl} />
        </AdminField>
        <AdminField label="展示 URL" span={2} hint={<AdminMediaHint folder="album" />}>
          <AdminInput name="displayImageUrl" defaultValue={photo?.displayImageUrl} />
        </AdminField>
        <AdminField label="缩略图 URL" span={2} hint={<AdminMediaHint folder="album" />}>
          <AdminInput name="thumbnailImageUrl" defaultValue={photo?.thumbnailImageUrl} />
        </AdminField>
        <AdminField label="描述" span={2}>
          <AdminTextarea name="description" defaultValue={photo?.description} />
        </AdminField>
        <AdminField label="Details JSON" span={2}>
          <AdminTextarea name="details" defaultValue={JSON.stringify(photo?.details || {}, null, 2)} className="font-mono text-xs" />
        </AdminField>
      </AdminFormGrid>
      <AdminFormActions><AdminSubmitButton icon="i-lucide-save">{photo ? '保存照片' : '新增照片'}</AdminSubmitButton></AdminFormActions>
    </form>
  )
}

export default async function AdminAlbumPage() {
  await requireAdminPage('/admin/album')
  const { categories, photos } = await getAdminAlbum()

  return (
    <section className="space-y-6">
      <AdminPageHeader eyebrow="媒体 / 相册管理" title="相册管理" description={`管理 ${categories.length} 个分类和 ${photos.length} 张照片。`} />
      <AdminCreatePanel title="新增分类" description="分类会显示为前台相册卡片。" icon="i-lucide-folder-plus">
        <CategoryForm />
      </AdminCreatePanel>
      <AdminCreatePanel title="新增照片" description="可填外链或上传到 Supabase Storage。" icon="i-lucide-image-plus">
        <PhotoForm categories={categories} />
      </AdminCreatePanel>
      <div className="space-y-3">
        {categories.map(category => (
          <AdminPanel key={category.id}>
            <details>
              <AdminItemHeader
                title={category.label}
                status={category.status}
                meta={[category.slug, `${category.photos.length} photos`, `排序 ${category.sortOrder}`]}
              />
              <CategoryForm category={category} />
              <div className="space-y-3 border-t border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3 md:p-4">
                {category.photos.map(photo => (
                  <AdminPanel key={photo.id}>
                    <details>
                      <AdminItemHeader
                        title={photo.label || 'Untitled'}
                        status={photo.status}
                        meta={[photo.takenAt, photo.imageUrl, `排序 ${photo.sortOrder}`]}
                        actions={(
                          <form action={deleteAlbumPhotoAction}>
                            <input type="hidden" name="id" value={photo.id} />
                            <AdminDangerButton icon="i-lucide-trash-2">删除</AdminDangerButton>
                          </form>
                        )}
                      />
                      <PhotoForm categories={categories} photo={photo} />
                    </details>
                  </AdminPanel>
                ))}
              </div>
            </details>
          </AdminPanel>
        ))}
        {categories.length === 0 && <AdminEmptyState icon="i-lucide-images" title="暂无相册" body="新增分类后即可上传照片。" />}
      </div>
    </section>
  )
}
