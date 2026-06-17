import Link from 'next/link'
import { uploadMedia } from '@/app/admin/actions'
import { getAdminMediaAssets, getMediaFolderLabel, MEDIA_FOLDERS } from '@/server/media/adapters/page'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { formatDate } from '@/lib/utils'
import {
  AdminEmptyState,
  AdminField,
  AdminFileInput,
  AdminFilterLink,
  AdminFormActions,
  AdminFormGrid,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminSelect,
  AdminSubmitButton,
  StatusBadge,
} from '@/components/admin/AdminPrimitives'
import { AdminCopyMediaButton, AdminDeleteMediaForm } from '@/components/admin/AdminMediaActions'

export const dynamic = 'force-dynamic'

interface AdminMediaPageProps {
  searchParams?: Promise<{
    folder?: string
  }>
}

function formatSize(size: number | null) {
  if (!size) return '未知大小'
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function isImage(asset: { mimeType: string | null, publicUrl: string }) {
  return asset.mimeType?.startsWith('image/') || /\.(avif|gif|heic|jpe?g|png|svg|webp)$/i.test(asset.publicUrl)
}

function buildFolderHref(folder: string) {
  return `/admin/media${folder === 'all' ? '' : `?folder=${folder}`}`
}

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  await requireAdminPage('/admin/media')
  const params = await searchParams
  const folder = params?.folder || 'all'
  const assets = await getAdminMediaAssets(folder)
  const uploadFolders = MEDIA_FOLDERS.filter(item => item !== 'all')

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="媒体资产 / 资源库"
        title="媒体资源库"
        description="上传、预览并复制 Supabase Storage 中的站点素材链接。"
        actions={(
          <Link href="/admin" className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm font-medium text-foreground hover:border-[var(--admin-border-strong)]">
            <span className="i-lucide-layout-dashboard text-base" />
            回到工作台
          </Link>
        )}
      />

      <AdminPanel>
        <AdminPanelHeader title="上传素材" description="文件会写入 site-media bucket；删除不会自动清理内容引用。" icon="i-lucide-upload-cloud" />
        <form action={uploadMedia}>
          <AdminFormGrid columns={4}>
            <AdminField label="目标目录">
              <AdminSelect name="folder" defaultValue={folder === 'all' ? 'uploads' : folder}>
                {uploadFolders.map(item => (
                  <option key={item} value={item}>{getMediaFolderLabel(item)}</option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label="选择文件" span={3}>
              <AdminFileInput name="files" accept="image/*,.svg,.webp,.avif,.heic" multiple required />
            </AdminField>
          </AdminFormGrid>
          <AdminFormActions>
            <AdminSubmitButton icon="i-lucide-upload">上传到媒体库</AdminSubmitButton>
          </AdminFormActions>
        </form>
      </AdminPanel>

      <AdminPanel className="p-3 md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">媒体目录</h3>
            <p className="mt-0.5 text-xs text-muted">当前显示 {assets.length} 个文件。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MEDIA_FOLDERS.map(item => (
              <AdminFilterLink key={item} href={buildFolderHref(item)} active={item === folder || (!params?.folder && item === 'all')}>
                {getMediaFolderLabel(item)}
              </AdminFilterLink>
            ))}
          </div>
        </div>
      </AdminPanel>

      {assets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {assets.map(asset => (
            <AdminPanel key={asset.path} className="min-w-0">
              <div className="aspect-[4/3] border-b border-[var(--admin-border)] bg-[var(--admin-surface-muted)]">
                {isImage(asset) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.publicUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <span className="i-lucide-file text-4xl" />
                  </div>
                )}
              </div>
              <div className="grid gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{asset.name}</h3>
                    <StatusBadge tone="muted">{getMediaFolderLabel(asset.folder)}</StatusBadge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">{asset.path}</p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                  <span>{formatSize(asset.size)}</span>
                  {asset.mimeType && <span>{asset.mimeType}</span>}
                  {asset.updatedAt && <span>{formatDate(asset.updatedAt)}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminCopyMediaButton value={asset.publicUrl} />
                  <Link href={asset.publicUrl} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--admin-border)] bg-background px-2.5 text-xs font-medium text-foreground hover:border-[var(--admin-border-strong)]">
                    <span className="i-lucide-external-link text-sm" />
                    预览
                  </Link>
                  <AdminDeleteMediaForm asset={asset} folder={folder} />
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      ) : (
        <AdminEmptyState icon="i-lucide-images" title="暂无媒体文件" body="上传素材后可在这里预览、复制链接并粘贴到文章或内容表单。" />
      )}
    </section>
  )
}
