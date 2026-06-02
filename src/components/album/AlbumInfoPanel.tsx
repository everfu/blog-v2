import type { AlbumPhoto } from '@/types'
import type { PhotoInfoState } from '@/features/album'

interface AlbumInfoPanelProps {
  photo?: AlbumPhoto
  info?: PhotoInfoState
  className?: string
}

const PHOTO_INFO_ICONS: Record<string, string> = {
  拍摄时间: 'i-lucide-calendar-clock',
  相机: 'i-lucide-camera',
  镜头: 'i-lucide-aperture',
  焦距: 'i-lucide-focus',
  光圈: 'i-lucide-circle-dot',
  快门: 'i-lucide-timer',
  ISO: 'i-lucide-gauge',
  曝光补偿: 'i-lucide-sun-medium',
  尺寸: 'i-lucide-ruler',
  软件: 'i-lucide-settings',
}

export default function AlbumInfoPanel({ photo, info, className = '' }: AlbumInfoPanelProps) {
  return (
    <aside className={`album-detail-panel overflow-hidden border border-border text-foreground shadow-2xl backdrop-blur-xl ${className}`}>
      <div className="border-b border-border p-4">
        {photo?.label && <h3 className="text-sm font-semibold leading-tight">{photo.label}</h3>}
        {photo?.description && (
          <p className="mt-2 text-xs leading-relaxed text-muted">{photo.description}</p>
        )}
      </div>

      <div className="max-h-[36vh] overflow-y-auto p-4 lg:max-h-[calc(100%-72px)]">
        {(info?.status === 'loading' || !info) && (
          <p className="text-xs text-muted">正在读取拍摄信息...</p>
        )}
        {(info?.status === 'empty' || info?.status === 'error') && (
          <p className="text-xs text-muted">暂无可用拍摄信息</p>
        )}
        {info?.status === 'ready' && (
          <dl className="grid grid-cols-[16px_72px_1fr] gap-x-2 gap-y-1.5 text-xs">
            {info.items.map((item) => (
              <div key={item.label} className="contents">
                <span
                  className={`${PHOTO_INFO_ICONS[item.label] ?? 'i-lucide-info'} mt-0.5 text-muted`}
                  aria-hidden="true"
                />
                <dt className="text-muted">{item.label}</dt>
                <dd className="break-words text-foreground/85">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  )
}
