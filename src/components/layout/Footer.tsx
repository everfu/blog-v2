import Link from 'next/link'
import { SectionDivider } from '@/components/common'
import { siteConfig } from '@/config/site'
import { OnlineCount } from '@/components/ui'

const SOCIAL_LINKS = [
  { href: siteConfig.social.github, icon: 'i-lucide-github', label: 'GitHub', external: true },
  { href: siteConfig.social.twitter, icon: 'i-lucide-twitter', label: 'Twitter', external: true },
  { href: '/atom.xml', icon: 'i-lucide-rss', label: 'Atom Feed', external: false },
] as const

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative">
      <div className="max-w-site mx-auto">
        <SectionDivider />
      </div>
      <div className="max-w-site mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-xs text-muted">
              {siteConfig.copyright.startYear} - {currentYear} {siteConfig.author.name}. All rights reserved.
            </p>
            <OnlineCount />
          </div>
          
          <nav className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ href, icon, label, external }) => (
              <Link
                key={label}
                href={href}
                {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                className="text-muted hover:opacity-60 transition-opacity"
                aria-label={label}
              >
                <div className={`${icon} text-base`} />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
