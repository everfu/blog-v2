import Link from 'next/link'
import type { HardwareItem } from '@/types'
import { cn } from '@/lib/utils'
import { getBackgroundImageUrl } from '@/lib/images/qiniu'

interface HardwareCardProps {
  item: HardwareItem
}

const CARD_CLASS = 'card group overflow-hidden relative'

export default function HardwareCard({ item }: HardwareCardProps) {
  const productImage = item.image ? getBackgroundImageUrl(item.image, 480) : undefined

  const content = (
    <div className="hardware-card relative w-full aspect-[4/3] bg-card overflow-hidden flex flex-col">
      <div className="hardware-overlay"></div>
      <svg className="hardware-pattern hidden md:block" width="90%" height="90%" viewBox="0 0 800 800">
          <rect fill="transparent" width="800" height="800"></rect>
          <g className="pattern-lines" fill="none" strokeWidth="1">
              <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63"></path>
              <path d="M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764"></path>
              <path d="M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880"></path>
              <path d="M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382"></path>
              <path d="M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269"></path>
          </g>
          <g className="pattern-joins">
              <circle cx="769" cy="229" r="5"></circle>
              <circle cx="539" cy="269" r="5"></circle>
              <circle cx="603" cy="493" r="5"></circle>
              <circle cx="731" cy="737" r="5"></circle>
              <circle cx="520" cy="660" r="5"></circle>
              <circle cx="309" cy="538" r="5"></circle>
              <circle cx="295" cy="764" r="5"></circle>
              <circle cx="40" cy="599" r="5"></circle>
              <circle cx="102" cy="382" r="5"></circle>
              <circle cx="127" cy="80" r="5"></circle>
              <circle cx="370" cy="105" r="5"></circle>
              <circle cx="578" cy="42" r="5"></circle>
              <circle cx="237" cy="261" r="5"></circle>
              <circle cx="390" cy="382" r="5"></circle>
          </g>
      </svg>
      {/* Wishlist 标签 */}
      {item.wishlist && (
        <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-foreground">
          Wishlist
        </div>
      )}
      
      {/* 标题 - 左上角 */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
        <h3 className="text-sm md:text-base font-bold text-foreground transition-opacity">
          {item.name}
        </h3>
      </div>
      
      {/* 产品图片 - 居中，移动端120x120，桌面端180x180 */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        {productImage ? (
          <figure 
            role="img"
            aria-label={item.name}
            className="w-[120px] h-[120px] md:w-[180px] md:h-[180px] bg-contain bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: `url(${productImage})` }}
          />
        ) : (
          <span className="i-lucide-image text-3xl md:text-4xl opacity-20 text-muted" />
        )}
      </div>
      
      {/* 分类标签 - 左下角 */}
      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10">
        <p className="text-xs md:text-sm text-muted">
          {item.category}
        </p>
      </div>
    </div>
  )

  if (item.url) {
    return (
      <Link href={item.url} target="_blank" rel="noopener noreferrer" className={cn('block', CARD_CLASS)}>
        {content}
      </Link>
    )
  }

  return <div className={CARD_CLASS}>{content}</div>
}
