'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'

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

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return (
    <div className="md:hidden">
      <button
        className="absolute right-2 top-2 p-2 w-8 h-8"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-label="Toggle menu"
      >
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
          <div className="i-lucide-x text-lg" />
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
          <div className="i-lucide-menu text-lg" />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-4 ml-4 pb-4 border-t border-border pt-4 flex flex-row flex-wrap gap-x-5 gap-y-3">
          {items.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-sm font-medium hover:opacity-60 transition-all group"
              style={{
                transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                opacity: isMenuOpen ? 1 : 0,
              }}
              onClick={closeMenu}
              target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : ''}
            >
              <span className="corner" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
