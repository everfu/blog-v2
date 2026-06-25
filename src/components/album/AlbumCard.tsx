import type { AlbumCategory } from '@/types'
import { cn } from '@/lib/utils'
import { OptimizedImage } from '@/components/common'

interface AlbumCardProps {
  category: AlbumCategory
  index?: number
  onClick?: () => void
  onHover?: () => void
  isBlurred?: boolean
}

export default function AlbumCard({ category, index = 0, onClick, onHover, isBlurred }: AlbumCardProps) {
  const photoCount = category.list?.length ?? 0
  const isEmpty = photoCount === 0

  return (
    <button
      type="button"
      className={cn(
        'card group relative aspect-[16/10] min-h-[148px] cursor-pointer overflow-hidden text-left',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isBlurred && 'blur-[4px] scale-[0.98] opacity-70'
      )}
      onClick={onClick}
      onMouseEnter={onHover}
      aria-label={`打开 ${category.label} 相册`}
    >
      {category.image ? (
        <div className="absolute inset-0 w-full h-full">
          <OptimizedImage
            src={category.image}
            alt={category.label}
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 780px) calc(50vw - 2rem), 340px"
            priority={index < 2}
            qiniuQuality={76}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      
      <div className="absolute inset-0 bg-black/25 transition-all duration-300 group-hover:bg-black/15" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-18 bg-gradient-to-b from-black/45 to-transparent" />
      
      <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wide text-white/65">
          Collection {String(index + 1).padStart(2, '0')}
        </span>
        <span className="border border-white/20 bg-black/20 px-2 py-0.5 font-mono text-[10px] uppercase text-white/75 backdrop-blur-sm">
          {isEmpty ? 'Empty' : `${photoCount} Photos`}
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10">
        <h3
          className="text-2xl font-bold italic tracking-wider text-white transition-transform duration-300 group-hover:-translate-y-0.5 md:text-3xl"
          style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.55)' }}
        >
          {category.label}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase text-white/60">
          {isEmpty ? 'Waiting for first photo' : 'Open collection'}
        </p>
      </div>
    </button>
  )
}
