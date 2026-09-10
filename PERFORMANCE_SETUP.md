# Performance Optimization Setup Guide

## What Was Done

### 1. Profile Pages Optimization
All profile-related pages now load with minimal DB calls:

- **`/profile`** - Fetches user auth (JWT) + profile + products in parallel
- **`/account`** - Single DB call for profile data (auth check uses JWT)
- **`/profile/edit`** - Single DB call for profile data (auth check uses JWT)

### 2. JWT Metadata Sync (Requires Database Setup)
A trigger was added to automatically sync key user fields into the JWT token metadata, eliminating the need for additional database queries on every page load.

## Required Database Setup

### Run This SQL in Supabase SQL Editor

Open your Supabase project → SQL Editor → paste and run the full contents of:

```
supabase/subscription_tiers_migration.sql
```

This file includes:
1. ✅ `subscription_tier` column (Elite/Expert/Beginner)
2. ✅ `count_conversations()` RPC function
3. ✅ **JWT metadata sync trigger** ← Critical for performance

### What the Trigger Does

Every time a user's role, verification status, or subscription changes:
```sql
UPDATE auth.users
SET raw_user_meta_data = {
  role: "buyer",
  is_verified: true,
  subscription_tier: "elite",
  is_subscribed: true
}
WHERE id = user_id;
```

This makes the JWT carry all critical profile fields, so pages can read them from `user.user_metadata` without hitting the database.

## Performance Impact

### Before:
- Login: 2-3 DB calls (auth check → profile fetch → role check)
- Profile page: 3 sequential DB calls (auth → profile → products)
- Account page: 2 sequential DB calls (auth → profile)

### After:
- Login: 0 DB calls (JWT refresh only)
- Profile page: 1 parallel DB call (profile + products together, auth from JWT)
- Account page: 1 DB call (profile only, auth from JWT)
- Logout: 0 DB calls (hard redirect, no await)

## Verification

After running the SQL migration, test:

1. Log in as any user
2. Navigate to `/profile` - should load instantly
3. Navigate to `/account` - should load instantly
4. Log out - should be instant (no delay)

## Notes

- `supabase.auth.getUser()` reads from JWT (local) - NOT a database call
- `supabase.from("users").select()` IS a database call
- The trigger ensures JWT metadata stays fresh automatically
