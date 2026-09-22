-- ============================================================
-- Fix: Add DELETE RLS policy to notifications table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Allow users to permanently delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);
