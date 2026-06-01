import type { Metadata } from 'next'
import '@unocss/reset/tailwind.css'
import './globals.css'
import { Header, Footer } from '@/components/layout'
import { siteConfig } from '@/../blog.config'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale.replace('-', '_'),
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.assets.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.assets.ogImage],
  },
  alternates: {
    canonical: siteConfig.url,
    types: {
      'application/atom+xml': `${siteConfig.url}/atom.xml`,
      'text/x-opml': `${siteConfig.url}/efu.opml`,
    },
  },
  icons: {
    icon: siteConfig.assets.favicon,
    apple: siteConfig.assets.appleTouchIcon,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={siteConfig.locale} suppressHydrationWarning>
      <body className="min-h-screen relative px-4 md:px-0" suppressHydrationWarning>
        <Header />
        <main className="max-w-[780px] mx-auto relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
