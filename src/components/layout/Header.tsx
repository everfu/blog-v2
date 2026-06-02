import Link from 'next/link'
import { SectionDivider } from '@/components/common'
import Logo from './Logo'
import MobileNavigation from './MobileNavigation'

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

        </div>
        <MobileNavigation items={NAV_ITEMS} />
      </nav>
      <SectionDivider />
    </header>
  )
}
