"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-8 w-8" aria-hidden="true" />
  }

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? 'light' : 'dark'
    const isAppearanceTransition =
      'startViewTransition' in document
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      setTheme(nextTheme)
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = document.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', nextTheme)
      setTheme(nextTheme)
    })

    transition.ready
      .then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]

        document.documentElement.animate(
          {
            clipPath: isDark ? clipPath : [...clipPath].reverse(),
          },
          {
            duration: 400,
            easing: 'ease-out',
            fill: 'forwards',
            pseudoElement: isDark
              ? '::view-transition-new(root)'
              : '::view-transition-old(root)',
          },
        )
      })
      .catch(() => undefined)
  }

  return (
    <button
      type="button"
      className="group relative flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={toggleTheme}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      <span className="corner opacity-0 group-focus-visible:opacity-100 group-focus-visible:scale-100" />
      <span className={isDark ? 'i-lucide-sun-medium text-base' : 'i-lucide-moon text-base'} />
    </button>
  )
}
