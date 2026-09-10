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
