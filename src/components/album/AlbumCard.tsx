import type { AlbumCategory } from '@/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AlbumCardProps {
  category: AlbumCategory
  onClick?: () => void
  onHover?: () => void
  isBlurred?: boolean
}

export default function AlbumCard({ category, onClick, onHover, isBlurred }: AlbumCardProps) {
  return (
    <div 
      className={cn(
        'relative overflow-hidden group cursor-pointer transition-all duration-300 min-h-[120px]',
        isBlurred && 'blur-[5px] scale-[0.98]'
      )}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      {category.image ? (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={category.image}
            alt={category.label}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />
      
      <h3 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-white font-bold italic text-center transition-all ease-in-out duration-300 text-2xl md:text-3xl blur-[1.5px] group-hover:blur-0 tracking-wider"
        style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.6)' }}
      >
        {category.label}
      </h3>
    </div>
  )
}

