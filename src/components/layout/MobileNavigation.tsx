'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type NavItem = {
  name: string
  href: string
  target: '_self' | '_blank'
}

interface MobileNavigationProps {
  items: NavItem[]
}

export default function MobileNavigation({ items }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeMenu, isMenuOpen])

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        className="group relative z-50 flex h-9 w-9 items-center justify-center text-foreground transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-site-navigation"
        aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
      >
        <span className="corner opacity-0 group-focus-visible:opacity-100 group-focus-visible:scale-100" />
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0',
          )}
          aria-hidden="true"
        >
          <span className="i-lucide-x text-lg" />
        </span>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isMenuOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100',
          )}
          aria-hidden="true"
        >
          <span className="i-lucide-menu text-lg" />
        </span>
      </button>

      <div
        id="mobile-site-navigation"
        aria-hidden={!isMenuOpen}
        className={cn(
          'absolute right-0 top-11 z-50 w-44 overflow-hidden border border-border bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out',
          isMenuOpen
            ? 'pointer-events-auto max-h-80 translate-y-0 opacity-100'
            : 'pointer-events-none max-h-0 -translate-y-2 opacity-0',
        )}
      >
        <nav className="grid p-2" aria-label="移动端主导航">
          {items.map((item, index) => (
            <MobileNavLink
              key={item.name}
              item={item}
              index={index}
              isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
              isMenuOpen={isMenuOpen}
              onClick={closeMenu}
              tabIndex={isMenuOpen ? undefined : -1}
            />
          ))}
        </nav>
      </div>
    </div>
  )
}

function MobileNavLink({
  item,
  index,
  isActive,
  isMenuOpen,
  onClick,
  tabIndex,
}: {
  item: NavItem
  index: number
  isActive: boolean
  isMenuOpen: boolean
  onClick: () => void
  tabIndex?: number
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex min-h-11 items-center justify-between gap-5 border-b border-border/70 px-3 py-2.5 text-sm font-semibold tracking-wide transition-all last:border-b-0 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
      )}
      style={{
        transitionDelay: isMenuOpen ? String(index * 45) + 'ms' : '0ms',
        transform: isMenuOpen ? 'translateY(0)' : 'translateY(-6px)',
        opacity: isMenuOpen ? 1 : 0,
      }}
      onClick={onClick}
      target={item.target}
      rel={item.target === '_blank' ? 'noopener noreferrer' : ''}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={tabIndex}
    >
      <span className="flex items-center gap-3">
        <span className="font-mono text-[11px] font-medium text-muted">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-mono text-[11px] text-border">/</span>
        <span>{item.name}</span>
      </span>

      <span
        className={cn(
          'h-1.5 w-1.5 rotate-45 border border-current transition-all',
          isActive ? 'bg-foreground opacity-100' : 'opacity-0 group-hover:opacity-60 group-focus-visible:opacity-100',
        )}
        aria-hidden="true"
      />
    </Link>
  )
}
