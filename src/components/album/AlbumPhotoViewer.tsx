import Image from 'next/image'
import type { AlbumCategory, AlbumPhoto } from '@/types'

interface AlbumPhotoViewerProps {
  category: AlbumCategory
  photo?: AlbumPhoto
}

export default function AlbumPhotoViewer({ category, photo }: AlbumPhotoViewerProps) {
  return (
    <div className="album-detail-surface relative min-h-[48vh] overflow-hidden border border-border shadow-2xl md:min-h-[58vh] lg:h-[calc(100vh-220px)] lg:min-h-0">
      {photo && (
        <Image
          key={photo.image}
          src={photo.image}
          alt={photo.label || category.label}
          fill
          sizes="(max-width: 1024px) calc(100vw - 2rem), calc(100vw - 460px)"
          className="object-contain"
          priority
        />
      )}
    </div>
  )
}
