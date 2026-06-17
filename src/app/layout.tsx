import type { Metadata } from 'next'
import '@unocss/reset/tailwind.css'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { siteConfig } from '@/config/site'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
      'application/atom+xml': '/atom.xml',
      'text/x-opml': '/efu.opml',
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
  const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('theme') || 'system';
        var resolved = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;
        document.documentElement.setAttribute('data-theme', resolved);
        document.documentElement.style.colorScheme = resolved;
      } catch (_) {}
    })();
  `

  return (
    <html lang={siteConfig.locale} suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
