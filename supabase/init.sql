create extension if not exists pgcrypto;
create extension if not exists pg_cron;

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.admin_passkey_state(p_email text)
returns table(user_id uuid, passkey_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    u.id as user_id,
    (select count(*) from auth.webauthn_credentials c where c.user_id = u.id) as passkey_count
  from auth.users u
  where u.email = lower(trim(p_email))
    and u.deleted_at is null
  limit 1;
$$;

revoke all on function private.admin_passkey_state(text) from public, anon, authenticated;
grant execute on function private.admin_passkey_state(text) to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
  view_count integer not null default 0 check (view_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  visitor_hash text not null,
  ip_hash text not null,
  user_agent_hash text not null,
  created_at timestamptz not null default now(),
  unique (post_id, visitor_hash)
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
  author_email text,
  email_hash text,
  website text,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'spam', 'deleted')),
  ip_hash text,
  user_agent text,
  auth_mode text not null default 'email' check (auth_mode in ('email', 'authenticated')),
  location_label text,
  country text,
  region text,
  city text,
  ua_browser text,
  ua_browser_version text,
  ua_os text,
  ua_device text,
  ua_request_id text,
  metadata jsonb not null default '{}',
  like_count integer not null default 0 check (like_count >= 0),
  is_featured boolean not null default false,
  is_pinned boolean not null default false,
  viewer_token_hash text,
  handled_at timestamptz,
  handled_by uuid references auth.users(id) on delete set null,
  operator_note text,
  notified_owner_at timestamptz,
  notified_reply_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  visitor_hash text not null,
  ip_hash text not null,
  user_agent_hash text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, visitor_hash)
);

create table if not exists public.comment_attachments (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  width integer,
  height integer,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.comment_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.comment_moderation_events (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (
    action in (
      'approved',
      'pending',
      'spam',
      'deleted',
      'reply',
      'bulk_moderate',
      'feature',
      'unfeature',
      'pin',
      'unpin',
      'handled',
      'unhandled',
      'note',
      'bulk_feature',
      'bulk_unfeature',
      'bulk_pin',
      'bulk_unpin',
      'bulk_handled',
      'bulk_unhandled'
    )
  ),
  previous_status text check (previous_status in ('pending', 'approved', 'spam', 'deleted')),
  next_status text check (next_status in ('pending', 'approved', 'spam', 'deleted')),
  note text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.comment_moderation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_type text not null check (rule_type in ('keyword', 'email_hash', 'ip_hash', 'page_path', 'ua')),
  match_value text not null,
  action text not null default 'pending' check (action in ('pending', 'spam')),
  enabled boolean not null default true,
  hit_count integer not null default 0 check (hit_count >= 0),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watched_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rating numeric(3,1) not null check (rating >= 0 and rating <= 10),
  year text not null,
  country text not null default '',
  genre text not null default '',
  director text not null default '',
  watched_at date not null,
  image_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.album_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text not null default '',
  cover_image_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.album_photos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.album_categories(id) on delete cascade,
  label text,
  image_url text not null,
  display_image_url text,
  thumbnail_image_url text,
  taken_at date,
  description text,
  details jsonb not null default '{}',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stack_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind text not null check (kind in ('hardware', 'software')),
  description text not null default '',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stack_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.stack_categories(id) on delete set null,
  kind text not null check (kind in ('hardware', 'software')),
  name text not null,
  description text not null default '',
  item_category text not null default '',
  icon text,
  image_url text,
  url text,
  recommended boolean not null default false,
  wishlist boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.friend_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.friend_links (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.friend_groups(id) on delete set null,
  author text not null,
  sitenick text,
  description text not null default '',
  link_url text not null,
  feed_url text,
  feed_muted boolean not null default false,
  icon_url text,
  avatar_url text,
  archs text[] not null default '{}',
  joined_at date not null default current_date,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.friend_feed_snapshots (
  id uuid primary key default gen_random_uuid(),
  friend_link_id uuid references public.friend_links(id) on delete cascade,
  author text not null,
  sitenick text,
  avatar_url text,
  site_link text not null,
  archs text[] not null default '{}',
  title text not null,
  link_url text not null,
  summary text not null default '',
  cover_url text,
  pub_date timestamptz not null,
  source_status jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.friend_application_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.friend_link_applications (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  site_name text not null,
  description text not null,
  site_url text not null,
  avatar_url text,
  feed_url text,
  contact text not null,
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'handled', 'rejected')),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  subtitle text not null default '',
  enabled boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
create index if not exists post_likes_post_id_idx on public.post_likes(post_id);
create index if not exists post_likes_created_at_idx on public.post_likes(created_at desc);
create index if not exists post_revisions_post_id_idx on public.post_revisions(post_id);
create index if not exists post_revisions_created_by_idx on public.post_revisions(created_by);
create index if not exists comments_page_idx on public.comments(page_path, status, created_at);
create index if not exists comments_parent_idx on public.comments(parent_id);
create index if not exists comments_status_idx on public.comments(status, created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists comments_auth_mode_idx on public.comments(auth_mode);
create index if not exists comments_location_idx on public.comments(country, region, city);
create index if not exists comments_email_hash_idx on public.comments(email_hash);
create index if not exists comments_created_at_idx on public.comments(created_at desc);
create index if not exists comments_page_status_idx on public.comments(page_path, status, created_at desc);
create index if not exists comments_notified_reply_idx on public.comments(parent_id, notified_reply_at);
create index if not exists comments_operations_idx on public.comments(status, is_pinned desc, is_featured desc, handled_at, created_at desc);
create index if not exists comments_source_idx on public.comments(country, region, city, ua_browser, ua_os, ua_device);
create index if not exists comments_like_count_idx on public.comments(like_count desc, created_at desc);
create index if not exists comments_handled_by_idx on public.comments(handled_by);
create index if not exists comments_viewer_pending_idx on public.comments(page_path, viewer_token_hash, status, created_at desc) where viewer_token_hash is not null;
create index if not exists comments_public_display_idx on public.comments(page_path, status, is_pinned desc, is_featured desc, created_at desc);
create index if not exists comment_likes_comment_id_idx on public.comment_likes(comment_id);
create index if not exists comment_likes_created_at_idx on public.comment_likes(created_at desc);
create index if not exists comment_attachments_comment_id_idx on public.comment_attachments(comment_id);
create index if not exists comment_attachments_user_id_idx on public.comment_attachments(user_id);
create index if not exists comment_attachments_status_idx on public.comment_attachments(status, created_at desc);
create index if not exists comment_moderation_events_comment_id_idx on public.comment_moderation_events(comment_id, created_at desc);
create index if not exists comment_moderation_events_actor_id_idx on public.comment_moderation_events(actor_id, created_at desc);
create index if not exists comment_moderation_rules_type_value_idx on public.comment_moderation_rules(rule_type, match_value);
create index if not exists watched_items_public_idx on public.watched_items(status, sort_order, watched_at desc);
create index if not exists album_categories_public_idx on public.album_categories(status, sort_order);
create index if not exists album_photos_category_idx on public.album_photos(category_id, status, sort_order);
create index if not exists stack_categories_public_idx on public.stack_categories(kind, status, sort_order);
create index if not exists stack_items_public_idx on public.stack_items(kind, status, sort_order);
create index if not exists friend_groups_public_idx on public.friend_groups(status, sort_order);
create index if not exists friend_links_group_idx on public.friend_links(group_id, status, sort_order);
create index if not exists friend_links_feed_idx on public.friend_links(status, feed_url) where feed_url is not null;
create index if not exists friend_links_active_feed_idx on public.friend_links(status, feed_muted, feed_url) where feed_url is not null;
create index if not exists friend_feed_snapshots_pub_date_idx on public.friend_feed_snapshots(pub_date desc);
create index if not exists friend_link_applications_status_idx on public.friend_link_applications(status, created_at desc);
create index if not exists home_sections_public_idx on public.home_sections(enabled, sort_order);
create index if not exists admin_audit_logs_actor_id_idx on public.admin_audit_logs(actor_id);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);

select cron.unschedule(jobid)
from cron.job
where jobname = 'cleanup-admin-audit-logs';

select cron.schedule(
  'cleanup-admin-audit-logs',
  '15 19 * * *',
  $$
    delete from public.admin_audit_logs
    where created_at < now() - interval '7 days';
  $$
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at before update on public.posts for each row execute function public.set_updated_at();
drop trigger if exists set_comment_moderation_rules_updated_at on public.comment_moderation_rules;
create trigger set_comment_moderation_rules_updated_at before update on public.comment_moderation_rules for each row execute function public.set_updated_at();
drop trigger if exists set_watched_items_updated_at on public.watched_items;
create trigger set_watched_items_updated_at before update on public.watched_items for each row execute function public.set_updated_at();
drop trigger if exists set_album_categories_updated_at on public.album_categories;
create trigger set_album_categories_updated_at before update on public.album_categories for each row execute function public.set_updated_at();
drop trigger if exists set_album_photos_updated_at on public.album_photos;
create trigger set_album_photos_updated_at before update on public.album_photos for each row execute function public.set_updated_at();
drop trigger if exists set_stack_categories_updated_at on public.stack_categories;
create trigger set_stack_categories_updated_at before update on public.stack_categories for each row execute function public.set_updated_at();
drop trigger if exists set_stack_items_updated_at on public.stack_items;
create trigger set_stack_items_updated_at before update on public.stack_items for each row execute function public.set_updated_at();
drop trigger if exists set_friend_groups_updated_at on public.friend_groups;
create trigger set_friend_groups_updated_at before update on public.friend_groups for each row execute function public.set_updated_at();
drop trigger if exists set_friend_links_updated_at on public.friend_links;
create trigger set_friend_links_updated_at before update on public.friend_links for each row execute function public.set_updated_at();
drop trigger if exists set_friend_application_settings_updated_at on public.friend_application_settings;
create trigger set_friend_application_settings_updated_at before update on public.friend_application_settings for each row execute function public.set_updated_at();
drop trigger if exists set_friend_link_applications_updated_at on public.friend_link_applications;
create trigger set_friend_link_applications_updated_at before update on public.friend_link_applications for each row execute function public.set_updated_at();
drop trigger if exists set_home_sections_updated_at on public.home_sections;
create trigger set_home_sections_updated_at before update on public.home_sections for each row execute function public.set_updated_at();

create or replace function public.increment_post_view(p_post_id uuid)
returns table(view_count integer, like_count integer)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.posts
  set view_count = public.posts.view_count + 1
  where id = p_post_id
    and status = 'published'
  returning public.posts.view_count, public.posts.like_count;
end;
$$;

create or replace function public.record_post_like(
  p_post_id uuid,
  p_visitor_hash text,
  p_ip_hash text,
  p_user_agent_hash text
)
returns table(liked boolean, view_count integer, like_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if coalesce(length(trim(p_visitor_hash)), 0) = 0
    or coalesce(length(trim(p_ip_hash)), 0) = 0
    or coalesce(length(trim(p_user_agent_hash)), 0) = 0 then
    raise exception 'Missing visitor fingerprint';
  end if;

  insert into public.post_likes (post_id, visitor_hash, ip_hash, user_agent_hash)
  select p_post_id, p_visitor_hash, p_ip_hash, p_user_agent_hash
  where exists (
    select 1
    from public.posts
    where id = p_post_id
      and status = 'published'
  )
  on conflict (post_id, visitor_hash) do nothing;

  get diagnostics inserted_count = row_count;

  if inserted_count > 0 then
    return query
    update public.posts
    set like_count = public.posts.like_count + 1
    where id = p_post_id
    returning true, public.posts.view_count, public.posts.like_count;
  else
    return query
    select true, public.posts.view_count, public.posts.like_count
    from public.posts
    where id = p_post_id
      and status = 'published';
  end if;
end;
$$;

create or replace function public.record_comment_like(
  p_comment_id uuid,
  p_visitor_hash text,
  p_ip_hash text,
  p_user_agent_hash text
)
returns table(liked boolean, like_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if coalesce(length(trim(p_visitor_hash)), 0) = 0
    or coalesce(length(trim(p_ip_hash)), 0) = 0
    or coalesce(length(trim(p_user_agent_hash)), 0) = 0 then
    raise exception 'Missing visitor fingerprint';
  end if;

  insert into public.comment_likes (comment_id, visitor_hash, ip_hash, user_agent_hash)
  select p_comment_id, p_visitor_hash, p_ip_hash, p_user_agent_hash
  where exists (
    select 1
    from public.comments
    where id = p_comment_id
      and status = 'approved'
  )
  on conflict (comment_id, visitor_hash) do nothing;

  get diagnostics inserted_count = row_count;

  if inserted_count > 0 then
    return query
    update public.comments
    set like_count = public.comments.like_count + 1
    where id = p_comment_id
    returning true, public.comments.like_count;
  else
    return query
    select true, public.comments.like_count
    from public.comments
    where id = p_comment_id
      and status = 'approved';
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_revisions enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.comment_attachments enable row level security;
alter table public.comment_settings enable row level security;
alter table public.comment_moderation_events enable row level security;
alter table public.comment_moderation_rules enable row level security;
alter table public.watched_items enable row level security;
alter table public.album_categories enable row level security;
alter table public.album_photos enable row level security;
alter table public.stack_categories enable row level security;
alter table public.stack_items enable row level security;
alter table public.friend_groups enable row level security;
alter table public.friend_links enable row level security;
alter table public.friend_feed_snapshots enable row level security;
alter table public.friend_application_settings enable row level security;
alter table public.friend_link_applications enable row level security;
alter table public.home_sections enable row level security;
alter table public.admin_audit_logs enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.posts from anon, authenticated;
revoke all on public.post_likes from anon, authenticated;
revoke all on public.post_revisions from anon, authenticated;
revoke all on public.comments from anon, authenticated;
revoke all on public.comment_likes from anon, authenticated;
revoke all on public.comment_attachments from anon, authenticated;
revoke all on public.comment_settings from anon, authenticated;
revoke all on public.comment_moderation_events from anon, authenticated;
revoke all on public.comment_moderation_rules from anon, authenticated;
revoke all on public.watched_items from anon, authenticated;
revoke all on public.album_categories from anon, authenticated;
revoke all on public.album_photos from anon, authenticated;
revoke all on public.stack_categories from anon, authenticated;
revoke all on public.stack_items from anon, authenticated;
revoke all on public.friend_groups from anon, authenticated;
revoke all on public.friend_links from anon, authenticated;
revoke all on public.friend_feed_snapshots from anon, authenticated;
revoke all on public.friend_application_settings from anon, authenticated;
revoke all on public.friend_link_applications from anon, authenticated;
revoke all on public.home_sections from anon, authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update on public.posts to authenticated;
grant select on public.comments to anon, authenticated;
grant insert, update on public.comments to anon, authenticated;
grant select on public.comment_attachments to anon, authenticated;
grant insert, update on public.comment_attachments to authenticated;
grant select on public.comment_settings to anon, authenticated;
grant insert, update on public.comment_settings to authenticated;
grant select, insert on public.comment_moderation_events to authenticated;
grant select, insert, update, delete on public.comment_moderation_rules to authenticated;
grant select, insert on public.post_revisions to authenticated;
grant select, insert on public.admin_audit_logs to authenticated;
grant select on public.watched_items to anon, authenticated;
grant select on public.album_categories to anon, authenticated;
grant select on public.album_photos to anon, authenticated;
grant select on public.stack_categories to anon, authenticated;
grant select on public.stack_items to anon, authenticated;
grant select on public.friend_groups to anon, authenticated;
grant select on public.friend_links to anon, authenticated;
grant select on public.friend_feed_snapshots to anon, authenticated;
grant select on public.friend_application_settings to anon, authenticated;
grant select, update on public.friend_link_applications to authenticated;
grant insert, update, delete on public.watched_items to authenticated;
grant insert, update, delete on public.album_categories to authenticated;
grant insert, update, delete on public.album_photos to authenticated;
grant insert, update, delete on public.stack_categories to authenticated;
grant insert, update, delete on public.stack_items to authenticated;
grant insert, update, delete on public.friend_groups to authenticated;
grant insert, update, delete on public.friend_links to authenticated;
grant insert, update, delete on public.friend_feed_snapshots to authenticated;
grant insert, update on public.friend_application_settings to authenticated;
grant insert, update, delete on public.home_sections to authenticated;
grant select on public.home_sections to anon, authenticated;

create policy "own profile is readable" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "anon published posts are readable" on public.posts for select to anon using (status = 'published');
create policy "authenticated posts are readable" on public.posts for select to authenticated using (status = 'published' or (select private.is_admin()));
create policy "admin posts are insertable" on public.posts for insert to authenticated with check ((select private.is_admin()));
create policy "admin posts are editable" on public.posts for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "anon approved comments are readable" on public.comments for select to anon using (status = 'approved');
create policy "authenticated comments are readable" on public.comments for select to authenticated using (status = 'approved' or (select private.is_admin()));
create policy "comments are insertable" on public.comments for insert to anon, authenticated with check (true);
create policy "admin comments are editable" on public.comments for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin post revisions are readable" on public.post_revisions for select to authenticated using ((select private.is_admin()));
create policy "admin post revisions are insertable" on public.post_revisions for insert to authenticated with check ((select private.is_admin()));
create policy "admin audit logs are readable" on public.admin_audit_logs for select to authenticated using ((select private.is_admin()));
create policy "admin audit logs are insertable" on public.admin_audit_logs for insert to authenticated with check ((select private.is_admin()));
create policy "approved comment attachments are readable" on public.comment_attachments for select to anon, authenticated using (
  status = 'approved'
  and exists (
    select 1 from public.comments
    where comments.id = comment_attachments.comment_id
      and comments.status = 'approved'
  )
);
create policy "admin comment attachments are readable" on public.comment_attachments for select to authenticated using ((select private.is_admin()));
create policy "users can create pending comment attachments" on public.comment_attachments for insert to authenticated with check ((select auth.uid()) = user_id and status = 'pending');
create policy "users can update own pending comment attachments" on public.comment_attachments for update to authenticated using ((select auth.uid()) = user_id and status = 'pending') with check ((select auth.uid()) = user_id and status = 'pending');
create policy "comment settings are readable" on public.comment_settings for select to anon, authenticated using (key in ('emoji_packs', 'avatar_provider'));
create policy "admin comment settings are readable" on public.comment_settings for select to authenticated using ((select private.is_admin()));
create policy "admin comment settings are insertable" on public.comment_settings for insert to authenticated with check ((select private.is_admin()));
create policy "admin comment settings are editable" on public.comment_settings for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin comment moderation events are readable" on public.comment_moderation_events for select to authenticated using ((select private.is_admin()));
create policy "admin comment moderation events are insertable" on public.comment_moderation_events for insert to authenticated with check ((select private.is_admin()));
create policy "admin comment moderation rules are readable" on public.comment_moderation_rules for select to authenticated using ((select private.is_admin()));
create policy "admin comment moderation rules are insertable" on public.comment_moderation_rules for insert to authenticated with check ((select private.is_admin()));
create policy "admin comment moderation rules are editable" on public.comment_moderation_rules for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin comment moderation rules are deletable" on public.comment_moderation_rules for delete to authenticated using ((select private.is_admin()));
create policy "published watched items are readable" on public.watched_items for select to anon, authenticated using (status = 'published');
create policy "admin watched items are writable" on public.watched_items for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "published album categories are readable" on public.album_categories for select to anon, authenticated using (status = 'published');
create policy "admin album categories are writable" on public.album_categories for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "published album photos are readable" on public.album_photos for select to anon, authenticated using (status = 'published');
create policy "admin album photos are writable" on public.album_photos for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "published stack categories are readable" on public.stack_categories for select to anon, authenticated using (status = 'published');
create policy "admin stack categories are writable" on public.stack_categories for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "published stack items are readable" on public.stack_items for select to anon, authenticated using (status = 'published');
create policy "admin stack items are writable" on public.stack_items for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "published friend groups are readable" on public.friend_groups for select to anon, authenticated using (status = 'published');
create policy "admin friend groups are writable" on public.friend_groups for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "published friend links are readable" on public.friend_links for select to anon, authenticated using (status = 'published');
create policy "admin friend links are writable" on public.friend_links for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "friend feed snapshots are readable" on public.friend_feed_snapshots for select to anon, authenticated using (true);
create policy "admin friend feed snapshots are writable" on public.friend_feed_snapshots for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "friend application settings are readable" on public.friend_application_settings for select to anon, authenticated using (true);
create policy "admin friend application settings are insertable" on public.friend_application_settings for insert to authenticated with check ((select private.is_admin()));
create policy "admin friend application settings are editable" on public.friend_application_settings for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin friend link applications are readable" on public.friend_link_applications for select to authenticated using ((select private.is_admin()));
create policy "admin friend link applications are editable" on public.friend_link_applications for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "enabled home sections are readable" on public.home_sections for select to anon, authenticated using (enabled = true);
create policy "admin home sections are writable" on public.home_sections for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

insert into public.comment_settings (key, value)
values
  ('emoji_packs', '["https://owo.imaegoo.com/owo.json"]'::jsonb),
  ('avatar_provider', '{"enabled": true, "provider": "weavatar"}'::jsonb),
  ('smtp', '{
    "enabled": false,
    "host": "",
    "port": 465,
    "secure": true,
    "username": "",
    "password": "",
    "fromName": "",
    "fromEmail": "",
    "ownerEmail": ""
  }'::jsonb)
on conflict (key) do nothing;

insert into public.friend_application_settings (key, value)
values ('application_form', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('comment-images', 'comment-images', false, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('site-media', 'site-media', true, 10485760, array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "users can upload own comment images" on storage.objects for insert to authenticated with check (
  bucket_id = 'comment-images'
  and owner = (select auth.uid())
);
create policy "users can read own comment images" on storage.objects for select to authenticated using (
  bucket_id = 'comment-images'
  and owner = (select auth.uid())
);
create policy "approved comment images are readable" on storage.objects for select to anon, authenticated using (
  bucket_id = 'comment-images'
  and exists (
    select 1
    from public.comment_attachments
    join public.comments on comments.id = comment_attachments.comment_id
    where comment_attachments.storage_path = storage.objects.name
      and comment_attachments.status = 'approved'
      and comments.status = 'approved'
  )
);
create policy "public site media is readable" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
create policy "admin site media is insertable" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and (select private.is_admin()));
create policy "admin site media is editable" on storage.objects for update to authenticated using (bucket_id = 'site-media' and (select private.is_admin())) with check (bucket_id = 'site-media' and (select private.is_admin()));
create policy "admin site media is deletable" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and (select private.is_admin()));

revoke all on function public.increment_post_view(uuid) from public;
revoke all on function public.record_post_like(uuid, text, text, text) from public;
revoke all on function public.record_comment_like(uuid, text, text, text) from public;
grant execute on function public.increment_post_view(uuid) to service_role;
grant execute on function public.record_post_like(uuid, text, text, text) to service_role;
grant execute on function public.record_comment_like(uuid, text, text, text) to anon, authenticated;
