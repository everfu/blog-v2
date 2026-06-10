import Link from 'next/link'

const items = [
  { href: '/admin', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
  { href: '/admin/posts', label: 'Posts', icon: 'i-lucide-file-text' },
  { href: '/admin/comments', label: 'Comments', icon: 'i-lucide-message-square' },
  { href: '/admin/settings', label: 'Settings', icon: 'i-lucide-settings' },
]

export default function AdminNav() {
  return (
    <aside className="border-b border-border bg-card/45 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-4 py-4 lg:px-5 lg:py-6">
          <Link href="/admin" className="inline-flex items-center gap-3 hover:opacity-80">
            <span className="flex h-9 w-9 items-center justify-center border border-border bg-background">
              <span className="i-lucide-shield-check text-lg" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-foreground">Cube Admin</span>
              <span className="block text-[11px] uppercase tracking-wide text-muted">Publishing desk</span>
            </span>
          </Link>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:py-4">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-10 shrink-0 items-center gap-2 border border-transparent px-3 text-sm text-muted hover:border-border hover:bg-background hover:text-foreground lg:w-full"
            >
              <span className={`${item.icon} text-base`} />
              {item.label}
            </Link>
          ))}
          <Link
            href="/logout"
            className="inline-flex h-10 shrink-0 items-center gap-2 border border-transparent px-3 text-sm text-muted hover:border-border hover:bg-background hover:text-foreground lg:hidden"
          >
            <span className="i-lucide-log-out text-base" />
            Logout
          </Link>
        </nav>

        <div className="hidden border-t border-border p-3 lg:block">
          <Link
            href="/logout"
            className="inline-flex h-10 w-full items-center gap-2 px-3 text-sm text-muted hover:bg-background hover:text-foreground"
          >
            <span className="i-lucide-log-out text-base" />
            Logout
          </Link>
        </div>
      </div>
    </aside>
  )
}
