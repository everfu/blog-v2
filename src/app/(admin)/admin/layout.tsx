import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminNav />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-background/92 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Admin console</p>
                <h1 className="truncate text-lg font-semibold leading-tight text-foreground">Content Operations</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex h-9 w-9 items-center justify-center border border-border text-muted hover:border-foreground hover:text-foreground"
                  title="Open site"
                  aria-label="Open site"
                >
                  <span className="i-lucide-external-link text-base" />
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
