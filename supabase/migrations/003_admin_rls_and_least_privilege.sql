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

revoke all on public.profiles from anon, authenticated;
revoke all on public.posts from anon, authenticated;
revoke all on public.comments from anon, authenticated;
revoke all on public.post_revisions from anon, authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;

grant select on public.profiles to authenticated;

grant select on public.posts to anon, authenticated;
grant insert, update on public.posts to authenticated;

grant select on public.comments to anon, authenticated;
grant update on public.comments to authenticated;

grant select, insert on public.post_revisions to authenticated;
grant select, insert on public.admin_audit_logs to authenticated;

drop policy if exists "admin posts are readable" on public.posts;
create policy "admin posts are readable"
on public.posts for select
to authenticated
using (private.is_admin());

drop policy if exists "admin posts are insertable" on public.posts;
create policy "admin posts are insertable"
on public.posts for insert
to authenticated
with check (private.is_admin());

drop policy if exists "admin posts are editable" on public.posts;
create policy "admin posts are editable"
on public.posts for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "admin comments are readable" on public.comments;
create policy "admin comments are readable"
on public.comments for select
to authenticated
using (private.is_admin());

drop policy if exists "admin comments are editable" on public.comments;
create policy "admin comments are editable"
on public.comments for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "admin post revisions are readable" on public.post_revisions;
create policy "admin post revisions are readable"
on public.post_revisions for select
to authenticated
using (private.is_admin());

drop policy if exists "admin post revisions are insertable" on public.post_revisions;
create policy "admin post revisions are insertable"
on public.post_revisions for insert
to authenticated
with check (private.is_admin());

drop policy if exists "admin audit logs are readable" on public.admin_audit_logs;
create policy "admin audit logs are readable"
on public.admin_audit_logs for select
to authenticated
using (private.is_admin());

drop policy if exists "admin audit logs are insertable" on public.admin_audit_logs;
create policy "admin audit logs are insertable"
on public.admin_audit_logs for insert
to authenticated
with check (private.is_admin());
