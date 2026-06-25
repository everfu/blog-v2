import { deleteStackItemAction, saveStackCategoryAction, saveStackItemAction } from '@/app/admin/actions'
import { getAdminStack } from '@/server/content/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import {
  AdminCheckbox,
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
import type { StackKind } from '@/types/supabase'

export const dynamic = 'force-dynamic'

function KindSelect({ defaultValue }: { defaultValue?: StackKind }) {
  return (
    <AdminSelect name="kind" defaultValue={defaultValue || 'software'}>
      <option value="software">software</option>
      <option value="hardware">hardware</option>
    </AdminSelect>
  )
}

function CategoryForm({ category }: { category?: Awaited<ReturnType<typeof getAdminStack>>['categories'][number] }) {
  return (
    <form action={saveStackCategoryAction}>
      <input type="hidden" name="id" value={category?.id || ''} />
      <AdminFormGrid columns={4}>
        <AdminField label="Slug">
          <AdminInput name="slug" defaultValue={category?.slug} required />
        </AdminField>
        <AdminField label="名称">
          <AdminInput name="name" defaultValue={category?.name} required />
        </AdminField>
        <AdminField label="类型">
          <KindSelect defaultValue={category?.kind} />
        </AdminField>
        <AdminField label="状态">
          <AdminSelect name="status" defaultValue={category?.status || 'published'}><option value="published">已发布</option><option value="draft">草稿</option><option value="archived">归档</option></AdminSelect>
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={category?.sortOrder || 0} />
        </AdminField>
        <AdminField label="描述" span={3}>
          <AdminInput name="description" defaultValue={category?.description} />
        </AdminField>
      </AdminFormGrid>
      <AdminFormActions><AdminSubmitButton icon="i-lucide-save">{category ? '保存分类' : '新增分类'}</AdminSubmitButton></AdminFormActions>
    </form>
  )
}

function ItemForm({
  categories,
  item,
}: {
  categories: Awaited<ReturnType<typeof getAdminStack>>['categories']
  item?: Awaited<ReturnType<typeof getAdminStack>>['items'][number]
}) {
  return (
    <form action={saveStackItemAction}>
      <input type="hidden" name="id" value={item?.id || ''} />
      <AdminFormGrid columns={4}>
        <AdminField label="名称">
          <AdminInput name="name" defaultValue={item?.name} required />
        </AdminField>
        <AdminField label="类型">
          <KindSelect defaultValue={item?.kind} />
        </AdminField>
        <AdminField label="分类">
          <AdminSelect name="categoryId" defaultValue={item?.categoryId || ''}>
            <option value="">无</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.kind} / {category.name}</option>)}
          </AdminSelect>
        </AdminField>
        <AdminField label="硬件分类">
          <AdminInput name="itemCategory" defaultValue={item?.itemCategory} />
        </AdminField>
        <AdminField label="状态">
          <AdminSelect name="status" defaultValue={item?.status || 'published'}><option value="published">已发布</option><option value="draft">草稿</option><option value="archived">归档</option></AdminSelect>
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={item?.sortOrder || 0} />
        </AdminField>
        <AdminField label="Skill Icons 名称" hint="仅填写 skillicons.dev 支持的图标名，例如 vscode、notion、androidstudio；无需填写 URL 或 class。">
          <AdminInput name="icon" defaultValue={item?.icon} placeholder="vscode" />
        </AdminField>
        <AdminField label="链接">
          <AdminInput name="url" defaultValue={item?.url} />
        </AdminField>
        <AdminField label="图片 URL" span={2} hint={<AdminMediaHint folder="stack" />}>
          <AdminInput name="imageUrl" defaultValue={item?.imageUrl} />
        </AdminField>
        <AdminField label="上传图片" span={2}>
          <AdminFileInput name="imageFile" accept="image/*" />
        </AdminField>
        <AdminField label="标记">
          <AdminCheckbox name="recommended" defaultChecked={item?.recommended} label="推荐" />
        </AdminField>
        <AdminField label="愿望清单">
          <AdminCheckbox name="wishlist" defaultChecked={item?.wishlist} label="Wishlist" />
        </AdminField>
        <AdminField label="描述" span={2}>
          <AdminInput name="description" defaultValue={item?.description} />
        </AdminField>
      </AdminFormGrid>
      <AdminFormActions><AdminSubmitButton icon="i-lucide-save">{item ? '保存条目' : '新增条目'}</AdminSubmitButton></AdminFormActions>
    </form>
  )
}

export default async function AdminStackPage() {
  await requireAdminPage('/admin/stack')
  const { categories, items } = await getAdminStack()

  return (
    <section className="space-y-6">
      <AdminPageHeader eyebrow="Stack / 硬件与软件" title="硬件与软件" description={`管理 ${categories.length} 个分类和 ${items.length} 个条目。`} />
      <AdminCreatePanel title="新增分类" description="软件按分类分组，硬件可使用默认 Hardware 分类。" icon="i-lucide-folder-plus">
        <CategoryForm />
      </AdminCreatePanel>
      <AdminCreatePanel title="新增条目" description="支持 Skill Icons 名称、图片 URL 或上传图片。" icon="i-lucide-package-plus">
        <ItemForm categories={categories} />
      </AdminCreatePanel>
      <div className="space-y-3">
        {categories.map(category => (
          <AdminPanel key={category.id}>
            <details>
              <AdminItemHeader
                title={category.name}
                status={category.status}
                meta={[category.kind, category.slug, `排序 ${category.sortOrder}`]}
              />
              <CategoryForm category={category} />
              <div className="space-y-3 border-t border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3 md:p-4">
                {items.filter(item => item.categoryId === category.id).map(item => (
                  <AdminPanel key={item.id}>
                    <details>
                      <AdminItemHeader
                        title={item.name}
                        status={item.status}
                        meta={[item.kind, item.itemCategory, item.url, item.recommended && '推荐', item.wishlist && 'Wishlist']}
                        actions={(
                          <form action={deleteStackItemAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <AdminDangerButton icon="i-lucide-trash-2">删除</AdminDangerButton>
                          </form>
                        )}
                      />
                      <ItemForm categories={categories} item={item} />
                    </details>
                  </AdminPanel>
                ))}
              </div>
            </details>
          </AdminPanel>
        ))}
        {categories.length === 0 && <AdminEmptyState icon="i-lucide-boxes" title="暂无 Stack 分类" body="新增分类和条目后前台 Stack 页面会自动读取。" />}
      </div>
    </section>
  )
}
