-- ============================================================
-- Performance Indexes — Run in Supabase SQL Editor
-- ============================================================

-- Full-text search index on products title + brand
create index if not exists idx_products_title_search
  on public.products using gin(to_tsvector('english', title || ' ' || coalesce(brand, '')));

-- Composite index for common search pattern
create index if not exists idx_products_active_category
  on public.products(is_active, is_blocked, category)
  where is_active = true and is_blocked = false;

-- Index for price range queries
create index if not exists idx_products_price_active
  on public.products(price)
  where is_active = true and is_blocked = false;

-- Index for messages inbox query
create index if not exists idx_messages_conversation
  on public.messages(product_id, sender_id, receiver_id, created_at desc);

-- Index for user lookup by email
create index if not exists idx_users_email
  on public.users(email);
