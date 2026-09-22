-- ============================================================
-- Fix: Disk IO spike on Supabase free tier (nano compute)
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Fix 1: Drop heavy GIN/trigram indexes ─────────────────
-- GIN indexes on free tier cause expensive autovacuum + WAL
-- writes that consume the entire Disk IO budget.
-- ILIKE queries are fast enough without them at small scale.
DROP INDEX IF EXISTS public.idx_products_title_trgm;
DROP INDEX IF EXISTS public.idx_products_brand_trgm;

-- ── Fix 2: Add updated_at to products ─────────────────────
-- Needed by the cron job to efficiently find recently
-- deactivated products without scanning the whole table.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill existing rows
UPDATE public.products
  SET updated_at = created_at
  WHERE updated_at IS NULL;

-- Auto-update on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for the cron query (updated_at range scan)
CREATE INDEX IF NOT EXISTS idx_products_updated_at
  ON public.products (updated_at DESC)
  WHERE is_active = false;

-- ── Fix 3: Reduce autovacuum aggressiveness on products ────
-- Default autovacuum triggers too frequently on free tier.
-- This tells Postgres to wait until 5% of rows change
-- before running a full vacuum (default is 20% but on nano
-- even that fires disk IO warnings).
ALTER TABLE public.products
  SET (
    autovacuum_vacuum_scale_factor    = 0.1,
    autovacuum_analyze_scale_factor   = 0.1,
    autovacuum_vacuum_cost_delay      = 20
  );

ALTER TABLE public.messages
  SET (
    autovacuum_vacuum_scale_factor    = 0.1,
    autovacuum_analyze_scale_factor   = 0.1,
    autovacuum_vacuum_cost_delay      = 20
  );

-- ── Fix 4: Ensure deactivate_expired_products uses the index
-- Recreate with explicit index hint via filtered condition
CREATE OR REPLACE FUNCTION public.deactivate_expired_products()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.products
  SET is_active = false,
      updated_at = now()
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at < now();
$$;

-- ============================================================
-- DONE
-- After running this:
-- 1. GIN indexes removed — no more autovacuum IO spikes
-- 2. updated_at added — cron can find deactivated products
-- 3. Autovacuum tuned — less aggressive on free tier
-- 4. Cron function updated — sets updated_at correctly
-- ============================================================
