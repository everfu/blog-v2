import { OptimizedImage } from '@/components/common'
import { getAlbumDisplayImageSrc, getAlbumPreviewImageSrc } from '@/features/album/image-src'
import type { AlbumCategory, AlbumPhoto } from '@/types'

interface AlbumPhotoViewerProps {
  category: AlbumCategory
  photo?: AlbumPhoto
}

export default function AlbumPhotoViewer({ category, photo }: AlbumPhotoViewerProps) {
  const imageSrc = photo ? getAlbumDisplayImageSrc(photo) : undefined
  const previewSrc = photo ? getAlbumPreviewImageSrc(photo) : undefined

  return (
    <div className="album-detail-surface relative min-h-[48vh] overflow-hidden border border-border shadow-2xl md:min-h-[58vh] lg:h-[calc(100vh-220px)] lg:min-h-0">
      {photo && imageSrc && (
        <OptimizedImage
          key={imageSrc}
          src={imageSrc}
          alt={photo.label || category.label}
          fill
          sizes="(max-width: 1024px) calc(100vw - 2rem), calc(100vw - 460px)"
          className="object-contain"
          loading="eager"
          qiniuQuality={84}
          blurDataURL={previewSrc}
          placeholder={previewSrc ? 'blur' : undefined}
        />
      )}
    </div>
  )
}
