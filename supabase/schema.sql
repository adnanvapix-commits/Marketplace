-- ============================================================
-- MarketPlace Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (mirrors auth.users for easy querying)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  created_at timestamptz default now()
);

-- Products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  category text not null,
  image_url text not null,
  location text,
  created_at timestamptz default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  receiver_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  message text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES (for performance)
-- ============================================================

create index if not exists idx_products_price on public.products(price);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_messages_product_id on public.messages(product_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.messages enable row level security;

-- Users: anyone can read, only own row can be updated
create policy "Users are viewable by everyone" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Products: anyone can read, only owner can insert/update/delete
create policy "Products are viewable by everyone" on public.products
  for select using (true);

create policy "Authenticated users can insert products" on public.products
  for insert with check (auth.uid() = user_id);

create policy "Users can update own products" on public.products
  for update using (auth.uid() = user_id);

create policy "Users can delete own products" on public.products
  for delete using (auth.uid() = user_id);

-- Messages: only sender and receiver can read/write
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Authenticated users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- ============================================================
-- TRIGGER: Auto-insert into public.users on signup
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
-- Enable Realtime for messages table
-- ============================================================

alter publication supabase_realtime add table public.messages;
