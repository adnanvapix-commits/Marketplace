-- ============================================================
-- Security fixes for RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Fix 1: Products SELECT policy ─────────────────────────
-- The previous policy only allowed verified+subscribed users.
-- Service role (used by admin client) bypasses RLS entirely,
-- which is correct for server-side API routes that do their
-- own access checks. But we harden the anon/authenticated
-- role policies to prevent direct PostgREST API calls.

DROP POLICY IF EXISTS "Verified users can view products" ON public.products;

-- Only allow viewing active, non-blocked products
-- Users must be verified AND have an active (non-expired) subscription
CREATE POLICY "Verified subscribed users can view products" ON public.products
  FOR SELECT USING (
    is_active = true
    AND is_blocked = false
    AND (
      -- Admin bypass
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      -- Verified + subscribed with non-expired subscription
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND is_verified = true
          AND is_subscribed = true
          AND is_blocked = false
          AND (
            subscription_expiry IS NULL
            OR subscription_expiry > now()
          )
      )
    )
  );

-- ── Fix 2: Users SELECT policy ─────────────────────────────
-- "Users are viewable by everyone" is too broad.
-- Public profiles should be limited — email/phone/whatsapp
-- should only be visible to verified+subscribed users.
-- We keep it open for now since the app needs to show seller
-- info on product cards, but flag it for future column-level security.

-- ── Fix 3: Messages — prevent unsubscribed users from reading ──
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Subscribed users can view their own messages" ON public.messages
  FOR SELECT USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND (
            role = 'admin'
            OR (
              is_verified = true
              AND is_subscribed = true
              AND is_blocked = false
              AND (subscription_expiry IS NULL OR subscription_expiry > now())
            )
          )
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
CREATE POLICY "Subscribed users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND (
          role = 'admin'
          OR (
            is_verified = true
            AND is_subscribed = true
            AND is_blocked = false
            AND (subscription_expiry IS NULL OR subscription_expiry > now())
          )
        )
    )
  );

-- ── Fix 4: Products INSERT — require subscription ──────────
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
CREATE POLICY "Subscribed users can insert products" ON public.products
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND is_verified = true
        AND is_subscribed = true
        AND is_blocked = false
        AND (subscription_expiry IS NULL OR subscription_expiry > now())
    )
  );

-- ── Fix 5: Block suspended users from all operations ───────
-- Add is_blocked check to existing update/delete policies

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (
    auth.uid() = id
    AND NOT is_blocked
  );

DROP POLICY IF EXISTS "Users can update own products" ON public.products;
CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND is_blocked = true
    )
  );

DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND is_blocked = true
    )
  );

-- ── Fix 6: Support tickets — ensure users can only read own ─
-- (was missing a SELECT policy — users could potentially read others' tickets via PostgREST)
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
CREATE POLICY "Users can insert own tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DONE — RLS policies hardened. Service role still bypasses
-- RLS (correct for server-side API routes), but direct
-- PostgREST calls from client are now properly restricted.
-- ============================================================
