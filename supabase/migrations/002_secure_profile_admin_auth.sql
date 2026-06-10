drop policy if exists "public profiles are readable" on public.profiles;
drop policy if exists "own profile is editable" on public.profiles;

create policy "own profile is readable"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);
