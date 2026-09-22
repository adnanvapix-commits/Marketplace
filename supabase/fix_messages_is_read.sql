-- ============================================================
-- Fix: Add is_read column to messages table
-- The unread count API was querying messages.is_read which
-- didn't exist, causing 60+ errors per hour.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Add is_read column (default false = all existing messages unread)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- Index for fast unread count query (receiver_id + is_read)
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread
  ON public.messages (receiver_id, is_read)
  WHERE is_read = false;

-- Mark all existing messages as read (they're old, no point showing them as unread)
UPDATE public.messages SET is_read = true WHERE is_read = false;

-- Also add indexes on admin_logs foreign keys (flagged by Supabase advisor)
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_user_id
  ON public.admin_logs (target_user_id)
  WHERE target_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_logs_target_product_id
  ON public.admin_logs (target_product_id)
  WHERE target_product_id IS NOT NULL;
