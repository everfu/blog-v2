import Link from 'next/link'

const items = [
  { href: '/admin', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
  { href: '/admin/posts', label: 'Posts', icon: 'i-lucide-file-text' },
  { href: '/admin/comments', label: 'Comments', icon: 'i-lucide-message-square' },
  { href: '/admin/settings', label: 'Settings', icon: 'i-lucide-settings' },
]

export default function AdminNav() {
  return (
    <nav className="mx-4 my-5 flex flex-wrap gap-2 md:mx-8">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs text-muted hover:border-foreground hover:text-foreground"
        >
          <span className={`${item.icon} text-sm`} />
          {item.label}
        </Link>
      ))}
      <Link
        href="/logout"
        className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs text-muted hover:border-foreground hover:text-foreground"
      >
        <span className="i-lucide-log-out text-sm" />
        Logout
      </Link>
    </nav>
  )
}
