-- ============================================================
-- Profile Migration — Run in Supabase SQL Editor
-- ============================================================

-- Add missing profile fields to users table
alter table public.users
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists roles text[] default array['buyer'];

-- RLS: user can only read/update their own profile
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
