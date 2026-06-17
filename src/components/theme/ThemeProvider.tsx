"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'

type ThemeChoice = 'system' | 'light' | 'dark'
type Attribute = `data-${string}` | 'class'
const DEFAULT_THEMES = ['light', 'dark']

export interface ThemeProviderProps {
  children: ReactNode
  themes?: string[]
  forcedTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  defaultTheme?: string
  attribute?: Attribute | Attribute[]
  value?: Record<string, string>
}

interface ThemeContextValue {
  themes: string[]
  forcedTheme?: string
  setTheme: Dispatch<SetStateAction<string>>
  theme?: string
  resolvedTheme?: string
  systemTheme?: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextValue>({
  themes: [],
  setTheme: () => undefined,
})

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(storageKey: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  try {
    return localStorage.getItem(storageKey) || fallback
  } catch {
    return fallback
  }
}

function disableTransitions() {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode('*,*::before,*::after{transition:none!important}'))
  document.head.appendChild(style)
  return () => {
    window.getComputedStyle(document.body)
    setTimeout(() => document.head.removeChild(style), 1)
  }
}

export function applyThemeAttribute({
  attribute,
  enableColorScheme,
  resolvedTheme,
  themes,
  value,
}: {
  attribute: Attribute | Attribute[]
  enableColorScheme: boolean
  resolvedTheme: string
  themes: string[]
  value?: Record<string, string>
}) {
  const root = document.documentElement
  const mappedTheme = value?.[resolvedTheme] || resolvedTheme

  const applyAttribute = (attr: Attribute) => {
    if (attr === 'class') {
      const classNames = value ? themes.map(theme => value[theme] || theme) : themes
      root.classList.remove(...classNames)
      root.classList.add(mappedTheme)
      return
    }

    root.setAttribute(attr, mappedTheme)
  }

  const attributes = Array.isArray(attribute) ? attribute : [attribute]
  attributes.forEach(applyAttribute)

  if (enableColorScheme && (resolvedTheme === 'light' || resolvedTheme === 'dark')) {
    root.style.colorScheme = resolvedTheme
  }
}

export function ThemeProvider({
  children,
  themes = DEFAULT_THEMES,
  forcedTheme,
  enableSystem = true,
  disableTransitionOnChange = false,
  enableColorScheme = true,
  storageKey = 'theme',
  defaultTheme = enableSystem ? 'system' : 'light',
  attribute = 'data-theme',
  value,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() => getStoredTheme(storageKey, defaultTheme))
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => getSystemTheme())

  const resolvedTheme = (forcedTheme || theme) === 'system' && enableSystem
    ? systemTheme
    : forcedTheme || theme

  const setTheme = useCallback<Dispatch<SetStateAction<string>>>((nextTheme) => {
    setThemeState((currentTheme) => {
      const value = typeof nextTheme === 'function' ? nextTheme(currentTheme) : nextTheme
      try {
        localStorage.setItem(storageKey, value)
      } catch {
        // Ignore storage failures; the in-memory state still updates.
      }
      return value
    })
  }, [storageKey])

  useEffect(() => {
    if (!enableSystem) return undefined

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setSystemTheme(media.matches ? 'dark' : 'light')
    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [enableSystem])

  useEffect(() => {
    const restoreTransitions = disableTransitionOnChange ? disableTransitions() : undefined
    applyThemeAttribute({
      attribute,
      enableColorScheme,
      resolvedTheme,
      themes,
      value,
    })
    restoreTransitions?.()
  }, [attribute, disableTransitionOnChange, enableColorScheme, resolvedTheme, themes, value])

  const contextValue = useMemo<ThemeContextValue>(() => ({
    themes: enableSystem ? [...themes, 'system'] : themes,
    forcedTheme,
    setTheme,
    theme,
    resolvedTheme,
    systemTheme: enableSystem ? systemTheme : undefined,
  }), [enableSystem, forcedTheme, resolvedTheme, setTheme, systemTheme, theme, themes])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
