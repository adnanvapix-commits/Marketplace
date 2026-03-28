-- ============================================================
-- FULL SETUP — Run this ONCE in Supabase SQL Editor
-- Combines schema + admin + B2B migrations
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  is_verified boolean not null default false,
  is_subscribed boolean not null default false,
  is_blocked boolean not null default false,
  subscription_expiry timestamptz,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  company_name text,
  phone text,
  country text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  category text not null,
  image_url text not null,
  location text,
  brand text,
  quantity integer not null default 1 check (quantity > 0),
  condition text not null default 'new'
    check (condition in ('new', 'used', 'refurbished')),
  minimum_order_quantity integer not null default 1,
  is_active boolean not null default true,
  is_blocked boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  receiver_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.users(id) on delete set null,
  action text not null,
  target_user_id uuid references public.users(id) on delete set null,
  target_product_id uuid references public.products(id) on delete set null,
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_products_price on public.products(price);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_products_condition on public.products(condition);
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_messages_product_id on public.messages(product_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_is_subscribed on public.users(is_subscribed);
create index if not exists idx_users_is_verified on public.users(is_verified);
create index if not exists idx_admin_logs_created_at on public.admin_logs(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.messages enable row level security;
alter table public.admin_logs enable row level security;

-- Users policies
create policy "Users are viewable by everyone" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Admins can update any user" on public.users
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Products policies
create policy "Verified users can view products" on public.products
  for select using (
    is_active = true
    and (
      exists (select 1 from public.users where id = auth.uid() and role = 'admin')
      or
      exists (
        select 1 from public.users
        where id = auth.uid() and is_verified = true and is_subscribed = true
      )
    )
  );

create policy "Authenticated users can insert products" on public.products
  for insert with check (auth.uid() = user_id);

create policy "Users can update own products" on public.products
  for update using (auth.uid() = user_id);

create policy "Users can delete own products" on public.products
  for delete using (auth.uid() = user_id);

create policy "Admins can delete any product" on public.products
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update any product" on public.products
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Messages policies
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Authenticated users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Admin logs policy
create policy "Admins can manage logs" on public.admin_logs
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- TRIGGER: Auto-insert user on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table public.messages;

-- ============================================================
-- PROMOTE ADMIN ACCOUNT
-- Run after creating admin@gmail.com in Supabase Auth
-- ============================================================

insert into public.users (id, email, role, is_verified, is_subscribed, verification_status, is_blocked)
select id, email, 'admin', true, true, 'approved', false
from auth.users
where email = 'admin@gmail.com'
on conflict (id) do update
  set role = 'admin',
      is_verified = true,
      is_subscribed = true,
      verification_status = 'approved',
      is_blocked = false;
