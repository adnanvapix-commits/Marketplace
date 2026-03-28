-- ============================================================
-- Admin Panel Migration
-- Run this in your Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- 1. Add admin columns to users table
alter table public.users
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin')),
  add column if not exists is_subscribed boolean not null default false,
  add column if not exists subscription_expiry timestamptz,
  add column if not exists is_blocked boolean not null default false;

-- 2. Add is_blocked to products
alter table public.products
  add column if not exists is_blocked boolean not null default false;

-- 3. Admin logs table
create table if not exists public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.users(id) on delete set null,
  action text not null,          -- e.g. 'activate_subscription'
  target_user_id uuid references public.users(id) on delete set null,
  target_product_id uuid references public.products(id) on delete set null,
  details jsonb,
  created_at timestamptz default now()
);

-- 4. Index for fast admin queries
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_is_subscribed on public.users(is_subscribed);
create index if not exists idx_admin_logs_created_at on public.admin_logs(created_at desc);

-- 5. RLS for admin_logs (only admins can read/write)
alter table public.admin_logs enable row level security;

create policy "Admins can manage logs" on public.admin_logs
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. Allow admins to update ANY user row (for subscription management)
create policy "Admins can update any user" on public.users
  for update using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- 7. Allow admins to delete any product
create policy "Admins can delete any product" on public.products
  for delete using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- 8. Allow admins to update any product (for blocking)
create policy "Admins can update any product" on public.products
  for update using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- 9. Promote your account to admin
UPDATE public.users SET role = 'admin' WHERE email = 'admin@gmail.com';
