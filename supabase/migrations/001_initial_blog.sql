create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  year int not null check (year >= 1970 and year <= 3000),
  title text not null,
  excerpt text not null default '',
  content text not null,
  tags text[] not null default '{}',
  cover text,
  category text not null default 'DAILY',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  recent boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  post_id uuid references public.posts(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  email_hash text,
  website text,
  body text not null,
  status text not null default 'approved' check (status in ('pending', 'approved', 'spam', 'deleted')),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists posts_public_idx on public.posts(status, published_at desc);
create index if not exists posts_year_slug_idx on public.posts(year, slug);
create index if not exists comments_page_idx on public.comments(page_path, status, created_at);
create index if not exists comments_parent_idx on public.comments(parent_id);
create index if not exists comments_status_idx on public.comments(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_revisions enable row level security;
alter table public.comments enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "public profiles are readable" on public.profiles;
create policy "public profiles are readable"
on public.profiles for select
using (true);

drop policy if exists "published posts are readable" on public.posts;
create policy "published posts are readable"
on public.posts for select
using (status = 'published');

drop policy if exists "approved comments are readable" on public.comments;
create policy "approved comments are readable"
on public.comments for select
using (status = 'approved');

drop policy if exists "own profile is editable" on public.profiles;
create policy "own profile is editable"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
