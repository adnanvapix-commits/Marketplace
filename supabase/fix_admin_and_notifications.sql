-- ============================================================
-- Fix 1: Set admin role for your account
-- Replace 'your-email@here.com' with your actual login email
-- ============================================================

UPDATE public.users 
SET role = 'admin'
WHERE email = 'admin@gmail.com';

-- Verify it worked (should return your row with role = 'admin')
SELECT id, email, role FROM public.users WHERE email = 'your-email@here.com';


-- ============================================================
-- Fix 2: Add DELETE RLS policy to notifications table
-- Allows users to permanently delete their own notifications
-- ============================================================

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- Fix 3: Create admin_logs table if it doesn't exist
-- The admin verify route writes to this table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  details jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs (admin_id);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs (via service role in API routes — RLS bypassed there)
-- This just prevents direct client access
DROP POLICY IF EXISTS "No direct client access to logs" ON public.admin_logs;
CREATE POLICY "No direct client access to logs" ON public.admin_logs
  FOR ALL USING (false);
