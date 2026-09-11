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
