import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { getEmojiCategories } from './emoji'
import type { EmojiPack } from './types'

export function EmojiPicker({
  emojiPacks,
  onSelect,
}: {
  emojiPacks: EmojiPack[]
  onSelect: (icon: string) => void
}) {
  const categories = useMemo(() => getEmojiCategories(emojiPacks), [emojiPacks])
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategoryName, setActiveCategoryName] = useState('')
  const pickerRef = useRef<HTMLDivElement | null>(null)

  const activeCategory = useMemo(() => {
    if (categories.length === 0) return null
    return categories.find(category => category.name === activeCategoryName) || categories[0]
  }, [activeCategoryName, categories])

  useEffect(() => {
    if (!activeCategoryName && categories[0]) {
      setActiveCategoryName(categories[0].name)
    }
  }, [activeCategoryName, categories])

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (categories.length === 0 || !activeCategory) return null

  const isImageCategory = activeCategory.type === 'image'
  const isWideTextCategory = activeCategory.type === 'text' || activeCategory.type === 'emoticon'

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-label="选择表情"
        aria-expanded={isOpen}
        className="inline-flex h-10 w-10 items-center justify-center border border-border bg-background text-muted transition-colors hover:border-foreground hover:text-foreground"
      >
        <span className="i-lucide-smile text-xl" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-[min(760px,calc(100vw-2rem))] overflow-hidden border border-border bg-background text-foreground shadow-lg">
          <div
            className={cn(
              'grid max-h-72 gap-x-3 gap-y-2 overflow-y-auto p-4',
              isImageCategory
                ? 'grid-cols-[repeat(auto-fill,minmax(44px,1fr))]'
                : isWideTextCategory
                  ? 'grid-cols-[repeat(auto-fill,minmax(112px,1fr))]'
                  : 'grid-cols-[repeat(auto-fill,minmax(48px,1fr))]'
            )}
          >
            {activeCategory.items.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(isImageCategory ? `::${item.shortcode}::` : item.icon)
                  setIsOpen(false)
                }}
                title={item.text || item.icon}
                className={cn(
                  'flex h-10 min-w-0 items-center justify-center px-2 text-center transition-colors hover:bg-card focus-visible:bg-card focus-visible:outline-none',
                  isImageCategory ? 'h-12' : isWideTextCategory ? 'text-lg leading-none' : 'text-xl'
                )}
              >
                {isImageCategory ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.icon} alt={item.text || ''} className="h-8 w-8 object-contain" />
                ) : (
                  <span className="truncate">{item.icon}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 overflow-x-auto border-t border-border bg-card/60">
            {categories.map(category => {
              const active = category.name === activeCategory.name

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setActiveCategoryName(category.name)}
                  data-active={active}
                  className="h-11 shrink-0 px-5 text-sm font-semibold text-muted transition-colors hover:bg-background hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground"
                >
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
