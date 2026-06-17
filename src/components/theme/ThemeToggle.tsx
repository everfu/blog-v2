"use client"

import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useTheme } from './ThemeProvider'

type ThemeChoice = 'system' | 'light' | 'dark'

const THEME_SEQUENCE: ThemeChoice[] = ['system', 'light', 'dark']

const THEME_LABELS: Record<ThemeChoice, string> = {
  system: 'system',
  light: 'light',
  dark: 'dark',
}

function getNextTheme(theme: ThemeChoice) {
  const currentIndex = THEME_SEQUENCE.indexOf(theme)
  return THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length]
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-8 w-8" aria-hidden="true" />
  }

  const selectedTheme = (theme ?? 'system') as ThemeChoice
  const nextTheme = getNextTheme(selectedTheme)
  const resolvedNextTheme = nextTheme === 'system' ? getSystemTheme() : nextTheme
  const isDark = resolvedTheme === 'dark'
  const iconClass = selectedTheme === 'system'
    ? 'i-lucide-monitor-cog text-base'
    : selectedTheme === 'light'
      ? 'i-lucide-sun-medium text-base'
      : 'i-lucide-moon text-base'
  const label = `当前主题：${THEME_LABELS[selectedTheme]}，切换至 ${THEME_LABELS[nextTheme]}`

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const isAppearanceTransition =
      'startViewTransition' in document
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition || resolvedNextTheme === resolvedTheme) {
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
      document.documentElement.setAttribute('data-theme', resolvedNextTheme)
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
      className={`group relative flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      onClick={toggleTheme}
      title={label}
      aria-label={label}
    >
      <span className="corner opacity-0 group-focus-visible:opacity-100 group-focus-visible:scale-100" />
      <span className={iconClass} />
    </button>
  )
}
