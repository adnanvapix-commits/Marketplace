-- ============================================================
-- BULKORA Subscription Tiers Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add subscription_tier column to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier text
  CHECK (subscription_tier IN ('elite', 'expert', 'beginner'))
  DEFAULT NULL;

-- Index for fast tier-based sorting in product queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier
  ON public.users (subscription_tier);

-- Add tier_rank helper column to avoid CASE sorting overhead
-- (computed: elite=1, expert=2, beginner=3, null=4)
-- We handle this in the query layer instead of a generated column
-- for maximum Supabase/PostgREST compatibility.

-- Backfill: existing subscribed users with no tier get 'beginner'
UPDATE public.users
  SET subscription_tier = 'beginner'
  WHERE is_subscribed = TRUE
    AND subscription_tier IS NULL;

-- ============================================================
-- RPC: count distinct conversations (unique sender+product pairs)
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_conversations()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM (
    SELECT DISTINCT sender_id, product_id
    FROM public.messages
  ) AS distinct_conversations;
$$;

-- ============================================================
-- JWT Metadata Sync: auto-update auth.users.raw_user_meta_data
-- so role/is_verified/subscription_tier are always fresh in JWT
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_user_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Whenever users row changes, sync key fields into auth.users.raw_user_meta_data
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{role}', to_jsonb(NEW.role)
        ),
        '{is_verified}', to_jsonb(NEW.is_verified)
      ),
      '{subscription_tier}', to_jsonb(NEW.subscription_tier)
    ),
    '{is_subscribed}', to_jsonb(NEW.is_subscribed)
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON public.users;
CREATE TRIGGER sync_user_metadata_trigger
  AFTER INSERT OR UPDATE OF role, is_verified, subscription_tier, is_subscribed
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_metadata();

-- Backfill: sync existing users' metadata into JWT
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, role, is_verified, subscription_tier, is_subscribed 
    FROM public.users
  LOOP
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}', to_jsonb(user_record.role)
          ),
          '{is_verified}', to_jsonb(user_record.is_verified)
        ),
        '{subscription_tier}', to_jsonb(user_record.subscription_tier)
      ),
      '{is_subscribed}', to_jsonb(user_record.is_subscribed)
    )
    WHERE id = user_record.id;
  END LOOP;
END $$;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- After running this migration:
-- 1. All profile pages will load faster (JWT carries role/verification)
-- 2. Products from Elite sellers appear first in search results
-- 3. Admin panel shows conversation count correctly
-- ============================================================

-- ============================================================
-- Performance Indexes
-- Run these in Supabase SQL Editor for fast page loads
-- ============================================================

-- Messages: fast inbox query (order by created_at, filter by sender/receiver)
CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages (created_at DESC);

-- Messages: composite index for inbox query (sender OR receiver + created_at)
CREATE INDEX IF NOT EXISTS idx_messages_sender_created
  ON public.messages (sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_created
  ON public.messages (receiver_id, created_at DESC);

-- Messages: composite for chat window query (product + both parties)
CREATE INDEX IF NOT EXISTS idx_messages_product_sender_receiver
  ON public.messages (product_id, sender_id, receiver_id);

-- Products: composite for the main search query (active + not blocked + category)
CREATE INDEX IF NOT EXISTS idx_products_active_blocked
  ON public.products (is_active, is_blocked);

CREATE INDEX IF NOT EXISTS idx_products_active_category
  ON public.products (is_active, is_blocked, category);

-- Products: text search speedup (title, brand)
CREATE INDEX IF NOT EXISTS idx_products_title_trgm
  ON public.products USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_brand_trgm
  ON public.products USING gin (brand gin_trgm_ops);

-- Enable pg_trgm extension for the trigram indexes above
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users: fast single-row lookup by id (usually primary key, but explicit for planner)
CREATE INDEX IF NOT EXISTS idx_users_id_role
  ON public.users (id, role, is_verified, is_subscribed);

-- ============================================================
-- INDEXES COMPLETE — pages should now load significantly faster
-- ============================================================

-- ============================================================
-- Support Tickets Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_email text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'subscription', 'account', 'product', 'payment', 'verification', 'technical', 'other'
  )),
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.support_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.support_tickets (created_at DESC);

-- RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
CREATE POLICY "Users can insert own tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'support_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  END IF;
END $$;

-- ============================================================
-- DUMMY TEST DATA: 3 tier users + 4 electronics products each
-- Purpose: verify Elite > Expert > Beginner product sort order
-- NOTE: These insert into public.users only (no auth.users entry)
-- so they won't be able to log in — for testing sort order only.
-- Run AFTER the main migration.
-- ============================================================

-- Test user UUIDs (fixed so products reference them correctly)
DO $$
DECLARE
  elite_id   uuid := 'aaaaaaaa-0001-0001-0001-000000000001';
  expert_id  uuid := 'bbbbbbbb-0002-0002-0002-000000000002';
  beginner_id uuid := 'cccccccc-0003-0003-0003-000000000003';
BEGIN

  -- Insert users (upsert so re-running is safe)
  INSERT INTO public.users (id, email, full_name, company_name, role, is_verified, is_subscribed, subscription_tier, verification_status, created_at)
  VALUES
    (elite_id,    'test.elite@bulkora.com',    'Elite Tester',    'Elite Electronics Co.',    'seller', true, true, 'elite',    'approved', now()),
    (expert_id,   'test.expert@bulkora.com',   'Expert Tester',   'Expert Electronics LLC',   'seller', true, true, 'expert',   'approved', now()),
    (beginner_id, 'test.beginner@bulkora.com', 'Beginner Tester', 'Beginner Electronics FZE', 'seller', true, true, 'beginner', 'approved', now())
  ON CONFLICT (id) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    is_verified = true,
    is_subscribed = true;

  -- Elite user products (4 electronics)
  INSERT INTO public.products (user_id, seller_id, title, description, price, category, condition, quantity, minimum_order_quantity, brand, location, image_url, is_active, is_blocked, created_at)
  VALUES
    (elite_id, elite_id, 'iPhone 15 Pro Max 256GB',      'Brand new sealed Apple iPhone 15 Pro Max. Bulk orders welcome.',       3200, 'Electronics', 'new', 500, 10, 'Apple',   'Dubai, UAE', '', true, false, now() - interval '1 day'),
    (elite_id, elite_id, 'Samsung Galaxy S24 Ultra',     'Latest Samsung flagship. Factory unlocked. UAE stock.',                2800, 'Electronics', 'new', 300, 5,  'Samsung', 'Dubai, UAE', '', true, false, now() - interval '2 days'),
    (elite_id, elite_id, 'Sony WH-1000XM5 Headphones',  'Premium noise cancelling headphones. Bulk pricing available.',          450, 'Electronics', 'new', 200, 20, 'Sony',    'Dubai, UAE', '', true, false, now() - interval '3 days'),
    (elite_id, elite_id, 'MacBook Pro M3 14-inch',       'Apple MacBook Pro M3 chip, 16GB RAM, 512GB SSD. Business grade.',     6500, 'Electronics', 'new', 100, 2,  'Apple',   'Dubai, UAE', '', true, false, now() - interval '4 days')
  ON CONFLICT DO NOTHING;

  -- Expert user products (4 electronics)
  INSERT INTO public.products (user_id, seller_id, title, description, price, category, condition, quantity, minimum_order_quantity, brand, location, image_url, is_active, is_blocked, created_at)
  VALUES
    (expert_id, expert_id, 'iPhone 15 Pro Max 256GB',      'Brand new sealed Apple iPhone 15 Pro Max. Bulk orders welcome.',       3200, 'Electronics', 'new', 500, 10, 'Apple',   'Dubai, UAE', '', true, false, now() - interval '1 day'),
    (expert_id, expert_id, 'Samsung Galaxy S24 Ultra',     'Latest Samsung flagship. Factory unlocked. UAE stock.',                2800, 'Electronics', 'new', 300, 5,  'Samsung', 'Dubai, UAE', '', true, false, now() - interval '2 days'),
    (expert_id, expert_id, 'Sony WH-1000XM5 Headphones',  'Premium noise cancelling headphones. Bulk pricing available.',          450, 'Electronics', 'new', 200, 20, 'Sony',    'Dubai, UAE', '', true, false, now() - interval '3 days'),
    (expert_id, expert_id, 'MacBook Pro M3 14-inch',       'Apple MacBook Pro M3 chip, 16GB RAM, 512GB SSD. Business grade.',     6500, 'Electronics', 'new', 100, 2,  'Apple',   'Dubai, UAE', '', true, false, now() - interval '4 days')
  ON CONFLICT DO NOTHING;

  -- Beginner user products (4 electronics)
  INSERT INTO public.products (user_id, seller_id, title, description, price, category, condition, quantity, minimum_order_quantity, brand, location, image_url, is_active, is_blocked, created_at)
  VALUES
    (beginner_id, beginner_id, 'iPhone 15 Pro Max 256GB',      'Brand new sealed Apple iPhone 15 Pro Max. Bulk orders welcome.',       3200, 'Electronics', 'new', 500, 10, 'Apple',   'Dubai, UAE', '', true, false, now() - interval '1 day'),
    (beginner_id, beginner_id, 'Samsung Galaxy S24 Ultra',     'Latest Samsung flagship. Factory unlocked. UAE stock.',                2800, 'Electronics', 'new', 300, 5,  'Samsung', 'Dubai, UAE', '', true, false, now() - interval '2 days'),
    (beginner_id, beginner_id, 'Sony WH-1000XM5 Headphones',  'Premium noise cancelling headphones. Bulk pricing available.',          450, 'Electronics', 'new', 200, 20, 'Sony',    'Dubai, UAE', '', true, false, now() - interval '3 days'),
    (beginner_id, beginner_id, 'MacBook Pro M3 14-inch',       'Apple MacBook Pro M3 chip, 16GB RAM, 512GB SSD. Business grade.',     6500, 'Electronics', 'new', 100, 2,  'Apple',   'Dubai, UAE', '', true, false, now() - interval '4 days')
  ON CONFLICT DO NOTHING;

END $$;

-- ============================================================
-- VERIFY SORT ORDER: run this after inserting to confirm
-- Elite products should appear before Expert, Expert before Beginner
-- ============================================================
-- SELECT p.title, u.email, u.subscription_tier
-- FROM public.products p
-- JOIN public.users u ON u.id = p.seller_id
-- WHERE p.category = 'Electronics'
--   AND u.email LIKE 'test.%@bulkora.com'
-- ORDER BY
--   CASE u.subscription_tier
--     WHEN 'elite'    THEN 1
--     WHEN 'expert'   THEN 2
--     WHEN 'beginner' THEN 3
--     ELSE 4
--   END,
--   p.title;
