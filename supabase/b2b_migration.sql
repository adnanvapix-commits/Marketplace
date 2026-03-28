-- ============================================================
-- B2B Platform Migration
-- Run AFTER schema.sql and admin_migration.sql
-- ============================================================

-- 1. Upgrade users table
alter table public.users
  add column if not exists role text not null default 'buyer'
    check (role in ('buyer', 'seller', 'admin')),
  add column if not exists is_verified boolean not null default false,
  add column if not exists company_name text,
  add column if not exists phone text,
  add column if not exists country text,
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected'));

-- 2. Upgrade products table with B2B fields
alter table public.products
  add column if not exists quantity integer not null default 1 check (quantity > 0),
  add column if not exists condition text not null default 'new'
    check (condition in ('new', 'used', 'refurbished')),
  add column if not exists brand text,
  add column if not exists minimum_order_quantity integer not null default 1,
  add column if not exists is_active boolean not null default true;

-- 3. Indexes
create index if not exists idx_users_is_verified on public.users(is_verified);
create index if not exists idx_users_verification_status on public.users(verification_status);
create index if not exists idx_products_condition on public.products(condition);
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_is_active on public.products(is_active);

-- 4. RLS: only verified+subscribed users can see products
-- Drop old open policy first
drop policy if exists "Products are viewable by everyone" on public.products;

-- Verified+subscribed users can view active products
create policy "Verified users can view products" on public.products
  for select using (
    is_active = true
    and (
      -- admin always sees all
      exists (select 1 from public.users where id = auth.uid() and role = 'admin')
      or
      -- verified + subscribed users
      exists (
        select 1 from public.users
        where id = auth.uid()
          and is_verified = true
          and is_subscribed = true
      )
    )
  );

-- 5. Promote admin account — sets ALL required flags
update public.users
  set role = 'admin',
      is_verified = true,
      is_subscribed = true,
      verification_status = 'approved',
      is_blocked = false
  where email = 'admin@gmail.com';
