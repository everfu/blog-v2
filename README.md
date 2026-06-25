# Fuever's Blog

A quiet personal blog built with Next.js, Supabase, MDX, and UnoCSS.

## Stack

- Next.js 16 + React 19
- TypeScript
- UnoCSS
- Supabase
- next-mdx-remote + Shiki

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Initialize Supabase with `supabase/init.sql`.

## Scripts

```bash
pnpm dev        # start development server
pnpm build      # create production build
pnpm start      # start production server
pnpm check      # typecheck and lint
```

## Content

Posts, albums, friends, comments, watched items, stack entries, and home sections are managed from the admin pages. Post bodies live in Supabase and render as MDX.

Site metadata lives in `src/config/site.ts`.

## Deploy

Deploy on Vercel or any platform that supports Next.js. Configure the same environment variables before publishing.

## License

[MIT](./LICENSE)

Design credit: [suss.me](https://suus.me).
