import { saveHomeSectionAction } from '@/app/admin/actions'
import { getAdminHomeSections } from '@/server/content/adapters/page'
import { mergeDefaultHomeSections, parseHeroMetadata, parseListMetadata } from '@/server/home/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import {
  AdminCheckbox,
  AdminField,
  AdminFormActions,
  AdminFormGrid,
  AdminInput,
  AdminItemHeader,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminSubmitButton,
  AdminTextarea,
} from '@/components/admin/AdminPrimitives'

export const dynamic = 'force-dynamic'

type HomeSectionFormData = ReturnType<typeof mergeDefaultHomeSections>[number]

function SectionForm({ section }: { section: HomeSectionFormData }) {
  const heroMetadata = section.key === 'hero' ? parseHeroMetadata(section.metadata) : null
  const listMetadata = section.key === 'recent_posts' || section.key === 'recently_watched' ? parseListMetadata(section.metadata) : null

  return (
    <form action={saveHomeSectionAction}>
      <input type="hidden" name="id" value={section.id} />
      <input type="hidden" name="key" value={section.key} />
      <AdminFormGrid columns={4}>
        <AdminField label="标题">
          <AdminInput name="title" defaultValue={section.title} placeholder="标题" required />
        </AdminField>
        <AdminField label="排序">
          <AdminInput name="sortOrder" type="number" defaultValue={section.sortOrder} />
        </AdminField>
        <AdminField label="状态">
          <AdminCheckbox name="enabled" defaultChecked={section.enabled} label="启用" />
        </AdminField>
        <AdminField label="区块 Key">
          <AdminInput value={section.key} disabled />
        </AdminField>
        <AdminField label="副标题" span={4}>
          <AdminInput name="subtitle" defaultValue={section.subtitle} placeholder="副标题" />
        </AdminField>
        {heroMetadata && (
          <>
            <AdminField label="主标题" span={2} hint="使用反引号标注强调文字，例如 `thoughts`。">
              <AdminTextarea
                name="headline"
                defaultValue={heroMetadata.headline}
                rows={4}
                placeholder="A nook where `thoughts`"
              />
            </AdminField>
            <AdminField label="简介" span={2} hint="同样支持反引号强调，例如 `11 repositories`。">
              <AdminTextarea name="intro" defaultValue={heroMetadata.intro} rows={4} />
            </AdminField>
            <AdminField label="按钮文字" span={2}>
              <AdminInput name="buttonLabel" defaultValue={heroMetadata.buttonLabel} />
            </AdminField>
            <AdminField label="按钮链接" span={2}>
              <AdminInput name="buttonHref" type="url" defaultValue={heroMetadata.buttonHref} />
            </AdminField>
          </>
        )}
        {listMetadata && (
          <AdminField label="展示数量">
            <AdminInput name="limit" type="number" min={1} max={12} defaultValue={listMetadata.limit} />
          </AdminField>
        )}
      </AdminFormGrid>
      <AdminFormActions>
        <AdminSubmitButton icon="i-lucide-save">保存区块</AdminSubmitButton>
      </AdminFormActions>
    </form>
  )
}

export default async function AdminHomePage() {
  await requireAdminPage('/admin/home')
  const sections = mergeDefaultHomeSections(await getAdminHomeSections())

  return (
    <section className="space-y-6">
      <AdminPageHeader eyebrow="内容运营 / 首页编排" title="首页编排" description="管理首页区块开关、排序和展示参数。" />
      <AdminPanel>
        <AdminPanelHeader title="固定区块" description="首页只渲染系统支持的区块；保存后会刷新首页缓存。" icon="i-lucide-layout-template" />
      </AdminPanel>
      <div className="space-y-3">
        {sections.map((section, index) => (
          <AdminPanel key={section.key}>
            <details open={index === 0}>
              <AdminItemHeader
                title={section.title}
                status={section.enabled ? 'published' : 'archived'}
                meta={[section.key, section.subtitle || '无副标题', `排序 ${section.sortOrder}`]}
              />
              <SectionForm section={section} />
            </details>
          </AdminPanel>
        ))}
      </div>
    </section>
  )
}
