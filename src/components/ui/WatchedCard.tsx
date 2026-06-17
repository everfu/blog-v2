import type { WatchedItem } from '@/types'

interface WatchedCardProps {
  item: WatchedItem
}

function getStarRating(rating: number) {
  const fullStars = Math.floor(rating / 2)
  const hasHalfStar = rating % 2 >= 1
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  return { fullStars, hasHalfStar, emptyStars }
}

function StarRating({ rating, variant = 'default' }: { rating: number; variant?: 'default' | 'light' }) {
  const { fullStars, hasHalfStar, emptyStars } = getStarRating(rating)
  const emptyClass = variant === 'light' ? 'text-gray-400 opacity-50' : 'text-muted opacity-30'
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }, (_, i) => (
          <span key={`full-${i}`} className="i-lucide-star text-yellow-500 text-sm" style={{ fill: 'currentColor' }} />
        ))}
        {hasHalfStar && (
          <span className="i-lucide-star-half text-yellow-500 text-sm" style={{ fill: 'currentColor' }} />
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <span key={`empty-${i}`} className={`i-lucide-star text-sm ${emptyClass}`} />
        ))}
      </div>
      <span className={`text-sm ${variant === 'light' ? 'text-gray-300' : 'text-muted'}`}>{rating}</span>
    </div>
  )
}

export default function WatchedCard({ item }: WatchedCardProps) {
  const details = `${item.year} / ${item.country} / ${item.genre} / ${item.director}`

  return (
    <div className="card group overflow-hidden">
      {/* 移动端：背景图片布局 */}
      <div 
        className="md:hidden relative min-h-[200px] p-4 flex flex-col justify-end"
        style={{
          backgroundImage: item.image ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%), url(${item.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: item.image ? 'transparent' : 'var(--color-muted)'
        }}
      >
        {!item.image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="i-lucide-film text-4xl opacity-20 text-muted" />
          </div>
        )}
        
        <div className="relative z-10 text-white">
          <h3 className="text-base font-medium mb-2 group-hover:opacity-70 transition-opacity">
            {item.title}
          </h3>
          <div className="mb-2">
            <StarRating rating={item.rating} variant="light" />
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-1">{details}</p>
          <p className="text-xs text-gray-400">{item.date}</p>
        </div>
      </div>

      {/* 桌面端：横向布局 */}
      <div className="hidden md:flex gap-4 p-4">
        <div className="w-24 h-36 bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
          {item.image ? (
            <figure role="img" aria-label={item.title} className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
          ) : (
            <span className="i-lucide-film text-3xl opacity-20 text-muted" />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between text-foreground">
          <div>
            <h3 className="text-base font-medium mb-2 group-hover:opacity-70 transition-opacity">
              {item.title}
            </h3>
            <div className="mb-2">
              <StarRating rating={item.rating} />
            </div>
            <p className="text-xs text-muted leading-relaxed">{details}</p>
          </div>
          <p className="text-xs text-muted opacity-70 mt-2">{item.date}</p>
        </div>
      </div>
    </div>
  )
}
