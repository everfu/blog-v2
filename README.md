# Cube Blog

A modern, minimalist personal blog built with Next.js 16 and UnoCSS.

## Features

- ✨ Clean, minimalist design
- 📝 Supabase-backed MDX content with syntax highlighting (Shiki)
- 🎨 Atomic CSS with UnoCSS
- 🚀 Next.js 16 App Router
- 📱 Fully responsive
- 💬 Real-time online presence (Supabase Realtime)
- 🖼️ Photo album with lightbox
- � RSS feed (Atom)
- 🗺️ Auto-generated sitemap

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Styling**: [UnoCSS](https://unocss.dev/)
- **Content**: Supabase tables rendered with [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- **Syntax Highlighting**: [Shiki](https://shiki.style/)
- **Icons**: [Lucide](https://lucide.dev/) via @unocss/preset-icons
- **Real-time**: [Supabase Realtime](https://supabase.com/realtime)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the blog.

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
cube-blog/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── posts/        # Blog posts
│   │   ├── stack/        # Tech stack page
│   │   ├── album/        # Photo album
│   │   ├── atom.xml/     # RSS feed
│   │   └── sitemap.ts    # Sitemap generator
│   ├── components/       # React components
│   ├── config/           # Site configuration
│   ├── features/         # Domain logic
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
├── supabase/
│   └── init.sql          # Supabase schema initialization
├── uno.config.ts         # UnoCSS configuration
└── next.config.js        # Next.js configuration
```

## Configuration

Edit `src/config/site.ts` to customize site info:

```typescript
export const siteConfig = {
  name: "Your Blog Name",
  title: "Your Blog Title",
  description: "Your blog description",
  url: "https://your-domain.com",
  author: {
    name: "Your Name",
    email: "you@example.com",
  },
  // ...
}
```

## Content Management

Initialize Supabase with `supabase/init.sql`, then manage posts, album entries, watched items, stack items, friends, comments, and home sections through the admin pages. Blog post bodies are stored in the `posts.content` column and rendered as MDX.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

Compatible with Netlify, Cloudflare Pages, AWS Amplify, or self-hosted.

## License

[MIT](./LICENSE)

## Credit

Thank you design by [suss.me](https://suus.me).
