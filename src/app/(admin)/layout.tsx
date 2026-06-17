import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-shell min-h-screen bg-[var(--admin-bg)] text-foreground">
      <div className="lg:flex">
        <AdminNav />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
