-- ============================================================
-- Admin Role System Setup
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Ensure users table has role column
alter table public.users
  add column if not exists role text not null default 'user';

-- 2. Update role constraint to include all valid roles
alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check
  check (role in ('user', 'buyer', 'seller', 'admin'));

-- 3. Auto-insert user on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'buyer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Admin check function (callable from SQL)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- 5. Promote admin account
update public.users
  set role = 'admin',
      is_verified = true,
      is_subscribed = true,
      verification_status = 'approved',
      is_blocked = false
  where email = 'admin@gmail.com';

-- If admin not in users table yet, insert them
insert into public.users (id, email, role, is_verified, is_subscribed, verification_status)
select id, email, 'admin', true, true, 'approved'
from auth.users
where email = 'admin@gmail.com'
on conflict (id) do update
  set role = 'admin',
      is_verified = true,
      is_subscribed = true,
      verification_status = 'approved';
