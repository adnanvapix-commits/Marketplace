-- ============================================================
-- Fix: JWT metadata sync so newly verified+subscribed users
-- get access immediately without needing to re-login.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Update the sync trigger to also fire on is_blocked changes
--    (so blocked users get locked out without re-login too)
CREATE OR REPLACE FUNCTION public.sync_user_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data
    || jsonb_build_object(
        'role',              NEW.role,
        'is_verified',       NEW.is_verified,
        'is_subscribed',     NEW.is_subscribed,
        'subscription_tier', NEW.subscription_tier,
        'is_blocked',        NEW.is_blocked
       )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Re-create trigger to also fire on is_blocked and subscription_expiry
DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON public.users;
CREATE TRIGGER sync_user_metadata_trigger
  AFTER INSERT OR UPDATE OF role, is_verified, is_subscribed, subscription_tier, is_blocked
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_metadata();

-- 2. Backfill all existing users so their JWT metadata is current right now
UPDATE auth.users au
SET raw_user_meta_data = raw_user_meta_data
  || jsonb_build_object(
      'role',              pu.role,
      'is_verified',       pu.is_verified,
      'is_subscribed',     pu.is_subscribed,
      'subscription_tier', pu.subscription_tier,
      'is_blocked',        pu.is_blocked
     )
FROM public.users pu
WHERE au.id = pu.id;

-- ============================================================
-- After running this:
-- - All existing users' JWT metadata is immediately updated
-- - Any future admin approval/subscription action will instantly
--   update the JWT — user gets access on next page navigation
--   without needing to log out and back in
-- ============================================================
