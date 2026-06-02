import Image from 'next/image'
import type { AlbumCategory, AlbumPhoto } from '@/types'

interface AlbumThumbnailStripProps {
  category: AlbumCategory
  photos: AlbumPhoto[]
  selectedPhotoIndex: number
  onSelectPhoto: (index: number) => void
}

export default function AlbumThumbnailStrip({
  category,
  photos,
  selectedPhotoIndex,
  onSelectPhoto,
}: AlbumThumbnailStripProps) {
  return (
    <div className="album-detail-strip flex gap-2 overflow-x-auto border border-border p-2 shadow-lg backdrop-blur-xl">
      {photos.map((photo, index) => {
        const isSelected = selectedPhotoIndex === index

        return (
          <button
            type="button"
            key={`${photo.image}-${index}`}
            className={`album-detail-surface relative aspect-[4/3] w-20 shrink-0 overflow-hidden border-2 p-0.5 transition-opacity focus:outline-none focus-visible:border-primary md:w-24 ${
              isSelected ? 'border-primary opacity-100' : 'border-border opacity-55 hover:opacity-90'
            }`}
            onClick={() => onSelectPhoto(index)}
            aria-label={`选择照片 ${photo.label || `第 ${index + 1} 张`}`}
            aria-pressed={isSelected}
          >
            <Image
              src={photo.image}
              alt={photo.label || category.label}
              fill
              sizes="96px"
              className="object-contain p-0.5"
              loading={index < 8 ? 'eager' : 'lazy'}
            />
            <span className="album-detail-label absolute bottom-1 left-1.5 px-1 font-mono text-[10px] text-foreground shadow-sm backdrop-blur">
              {index + 1}
            </span>
          </button>
        )
      })}
    </div>
  )
}
