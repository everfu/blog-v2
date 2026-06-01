import type { AlbumCategory } from '@/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AlbumCardProps {
  category: AlbumCategory
  index?: number
  onClick?: () => void
  onHover?: () => void
  isBlurred?: boolean
}

export default function AlbumCard({ category, index = 0, onClick, onHover, isBlurred }: AlbumCardProps) {
  const photoCount = category.list?.length ?? 0

  return (
    <button
      type="button"
      className={cn(
        'relative overflow-hidden group cursor-pointer transition-all duration-300 min-h-[148px] aspect-[16/10] text-left',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isBlurred && 'blur-[4px] scale-[0.98] opacity-70'
      )}
      onClick={onClick}
      onMouseEnter={onHover}
      aria-label={`打开 ${category.label} 相册`}
    >
      {category.image ? (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={category.image}
            alt={category.label}
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 780px) calc(50vw - 2rem), 340px"
            priority={index < 2}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      
      <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-300" />
      <div className="absolute inset-x-0 bottom-0 h-18 bg-gradient-to-t from-black/70 to-transparent" />
      
      <h3 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-white font-bold italic text-center transition-all ease-in-out duration-300 text-2xl md:text-3xl blur-[1.2px] group-hover:blur-0 tracking-wider"
        style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.6)' }}
      >
        {category.label}
      </h3>

      <span className="absolute left-3 bottom-2 z-10 text-[11px] font-mono text-white/70">
        {photoCount > 0 ? `${photoCount} PHOTOS` : 'EMPTY'}
      </span>
    </button>
  )
}
