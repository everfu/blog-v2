'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import type { AlbumCategory } from '@/types'
import AlbumCard from './AlbumCard'

const AlbumDetail = dynamic(() => import('./AlbumDetail'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="h-8 w-8 border border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  ),
})

interface AlbumClientProps {
  categories: AlbumCategory[]
}

export default function AlbumClient({ categories }: AlbumClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<AlbumCategory | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleCardClick = useCallback((category: AlbumCategory) => {
    setSelectedCategory(category)
  }, [])

  const handleClose = useCallback(() => setSelectedCategory(null), [])
  const clearHover = useCallback(() => setHoveredCategory(null), [])
  const handleCardHover = useCallback((categoryName: string) => {
    setHoveredCategory(categoryName)
  }, [])

  return (
    <>
      <section>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mx-4 md:mx-8 my-8"
          onMouseLeave={clearHover}
        >
          {categories.map((category, index) => (
            <AlbumCard
              key={category.name}
              category={category}
              index={index}
              onClick={() => handleCardClick(category)}
              onHover={() => handleCardHover(category.name)}
              isBlurred={hoveredCategory !== null && hoveredCategory !== category.name}
            />
          ))}
        </div>
      </section>

      {selectedCategory && (
        <AlbumDetail category={selectedCategory} onClose={handleClose} />
      )}
    </>
  )
}
