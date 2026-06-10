import { Header, Footer } from '@/components/layout'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="site-shell relative min-h-screen px-4 md:px-0">
      <Header />
      <main className="relative z-10 mx-auto max-w-[780px]">
        {children}
      </main>
      <Footer />
    </div>
  )
}
