'use client'

import { useEffect, useState } from 'react'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function updateVisibility() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const distanceToBottom = documentHeight - (scrollTop + viewportHeight)

      setIsVisible(scrollTop > 400 && distanceToBottom < viewportHeight * 0.8)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [])

  if (!isVisible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background/90 text-muted shadow-lg backdrop-blur transition-colors hover:border-foreground hover:text-foreground md:right-8"
      aria-label="回到顶部"
    >
      <span className="i-lucide-arrow-up text-lg" />
    </button>
  )
}
