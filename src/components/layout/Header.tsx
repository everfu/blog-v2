'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'
import { SectionDivider } from '@/components/common'
import Logo from './Logo'

type NavItem = {
  name: string
  href: string
  target: '_self' | '_blank'
}

const NAV_ITEMS: NavItem[] = [
  { name: 'POSTS', href: '/posts', target: '_self' },
  { name: 'STACK', href: '/stack', target: '_self' },
  { name: 'ALBUM', href: '/album', target: '_self' },
  { name: 'FRIENDS', href: '/friends', target: '_self' },
  { name: 'LINKS', href: '/links', target: '_self' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return (
    <header className="max-w-[780px] mx-auto relative z-10">
      <nav className="px-2 md:px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-60 transition-opacity">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item, index) => (
              <Link 
                key={item.name}
                href={item.href}
                className="relative px-2 py-1 text-xs font-medium tracking-wide text-foreground transition-opacity group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                target={item.target}
                rel={item.target === '_blank' ? 'noopener noreferrer' : ''}
              >
                <span className="corner" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 relative w-8 h-8"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
              <div className="i-lucide-x text-lg" />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
              <div className="i-lucide-menu text-lg" />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mt-4 ml-4 pb-4 border-t border-border pt-4 flex flex-row flex-wrap gap-x-5 gap-y-3">
            {NAV_ITEMS.map((item, index) => (
              <Link 
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium hover:opacity-60 transition-all group"
                style={{ 
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                  transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                  opacity: isMenuOpen ? 1 : 0
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
      </nav>
      <SectionDivider />
    </header>
  )
}
