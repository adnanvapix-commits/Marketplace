 # Implementation Plan: Home Experience & Auth Flow

## Overview

Incremental implementation starting from the data layer (types, DB migration, store, utilities), moving through middleware and auth wiring, then building each UI surface (registration, /home, Navbar, Profile, Sell, Admin), and finishing with property-based tests.

## Tasks

- [x] 1. Foundation — types, DB migration, Zustand store, avatar utility
  - [x] 1.1 Extend `types/index.ts` — add `full_name`, `username`, `whatsapp_number`, `avatar_url`, `roles` to the `User` interface
    - Match the shape defined in the design's "Extended User Type" section
    - _Requirements: 3.1, 3.4, 11.1_
  - [x] 1.2 Extend `AdminUser` in `lib/services/adminService.ts` — add `full_name`, `username`, `company_name`, `whatsapp_number` fields
    - Update `fetchAdminUsers` select query to include the new columns
    - _Requirements: 13.2, 13.3_
  - [x] 1.3 Create `supabase/home_experience_migration.sql` — `ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number text, ADD COLUMN IF NOT EXISTS username text` plus the two indexes on `full_name` and `company_name`
    - _Requirements: 3.4, 13.3_
  - [x] 1.4 Extend `store/authStore.ts` — add `isVerified`, `selectedMode`, `userRole`, `hasCompletedProfile`, `lastVisitedPage` fields and their setters; initialise `selectedMode` from `localStorage` (default `"buy"`); persist on `setSelectedMode`
    - _Requirements: 11.1, 11.3, 11.4, 7.10, 7.11_
  - [ ]* 1.5 Write property test for `selectedMode` localStorage round-trip (Property 15)
    - **Property 15: Mode toggle selectedMode persists and restores**
    - **Validates: Requirements 7.10, 7.11, 11.3, 11.4**
    - File: `__tests__/property/homeExperience.property.test.ts`
  - [x] 1.6 Create `lib/utils/generateAvatar.ts` — implement `generateAvatarDataUri(fullName: string): string` as specified in the design (SVG circle with initials, base64-encoded data URI); handle empty-string fallback using email local part
    - _Requirements: 3.8_
  - [ ]* 1.7 Write unit tests for `generateAvatarDataUri` (specific name inputs → expected initials)
    - File: `__tests__/unit/generateAvatar.test.ts`
    - _Requirements: 3.8_
  - [ ]* 1.8 Write property test for avatar initials derivation (Property 7)
    - **Property 7: Avatar initials derivation**
    - **Validates: Requirements 3.8**
    - File: `__tests__/property/avatar.property.test.ts`

- [x] 2. Middleware updates — auth guard and verification gating
  - [x] 2.1 Rewrite `lib/supabase/middleware.ts` `updateSession` function:
    - Redirect authenticated users away from `/login` and `/register` → `/home` (Req 4.1, 4.2)
    - Redirect unauthenticated users from `/buy`, `/sell`, `/chat`, `/dashboard`, `/profile` → `/login` (Req 5.7, 10.3)
    - For authenticated unverified users on `/buy`, `/sell`, `/chat`, `/dashboard` → redirect to `/home` (Req 5.1–5.4)
    - For authenticated verified users on those routes → allow through (Req 5.6)
    - Redirect non-admin users from `/admin/*` → `/home` (Req 13.12)
    - On `users` table query failure → treat as unverified, redirect to `/home` (design error handling)
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 10.3, 13.12_
  - [ ]* 2.2 Write unit tests for middleware route/auth combinations
    - File: `__tests__/unit/middleware.test.ts`
    - _Requirements: 4.1, 4.2, 4.3, 5.1–5.7_
  - [ ]* 2.3 Write property tests for middleware (Properties 8, 9, 10, 11, 12, 24)
    - **Property 8: Auth guard redirects authenticated users away from auth routes**
    - **Property 9: Unauthenticated users can access auth routes**
    - **Property 10: Unverified users are blocked from gated routes**
    - **Property 11: Verified users have full access to gated routes**
    - **Property 12: Unauthenticated users are redirected to /login from protected routes**
    - **Property 24: Non-admin users cannot access /admin/users**
    - **Validates: Requirements 4.1, 4.2, 4.3, 5.1–5.7, 13.12**
    - File: `__tests__/property/authFlow.property.test.ts`

- [x] 3. AuthProvider — fetch extended profile fields
  - [x] 3.1 Update `components/AuthProvider.tsx` — on auth state change, fetch `role`, `is_verified`, `full_name`, `whatsapp_number` from `users` table and call `setIsVerified`, `setUserRole`, `setHasCompletedProfile` (profile is complete when `full_name` and `whatsapp_number` are non-null)
    - _Requirements: 11.1, 11.2_
  - [ ]* 3.2 Write property test for auth store reflecting DB state (Property 21)
    - **Property 21: Auth store reflects database verification state**
    - **Validates: Requirements 11.2**
    - File: `__tests__/property/authFlow.property.test.ts`

- [x] 4. Registration form — Full Name, WhatsApp, no role selector, avatar, redirect to /home
  - [x] 4.1 Update `app/login/page.tsx` signup branch:
    - Remove the Buy/Sell role selector UI and `roles` state
    - Add required Full Name field (maps to `full_name`)
    - Add required WhatsApp Number field with client-side regex validation `/^\+?[1-9]\d{6,14}$/` (maps to `whatsapp_number`)
    - Keep optional Company / Shop Name field
    - On successful `signUp`, upsert user record with `roles: ["buyer", "seller"]`, `role: "buyer"`, `is_verified: false`, `verification_status: "pending"`, `full_name`, `whatsapp_number`, and generated `avatar_url` from `generateAvatarDataUri(fullName)`
    - Redirect to `/home` (not `/pending`) after registration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  - [x] 4.2 Update login branch in `app/login/page.tsx`:
    - After successful sign-in, redirect admin → `/admin`, all others → `/home` (remove `/pending` and `/subscribe` redirects)
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 4.3 Write unit tests for registration validation (specific invalid inputs → specific errors)
    - File: `__tests__/unit/registrationValidation.test.ts`
    - _Requirements: 3.3, 3.4, 3.7_
  - [ ]* 4.4 Write property tests for registration form validation (Properties 3, 4, 5, 6)
    - **Property 3: New user record defaults**
    - **Property 4: Registration redirects to /home**
    - **Property 5: Registration form rejects missing required fields**
    - **Property 6: Password minimum length validation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.7**
    - File: `__tests__/property/formValidation.property.test.ts`
  - [ ]* 4.5 Write property tests for post-login redirect (Properties 1, 2)
    - **Property 1: Non-admin login redirects to /home**
    - **Property 2: Admin login redirects to /admin**
    - **Validates: Requirements 1.1, 1.2**
    - File: `__tests__/property/authFlow.property.test.ts`

- [ ] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Home page — `/home` route
  - [x] 6.1 Create `app/home/page.tsx` (Server Component) — fetch up to 6 trending products (order by `created_at desc`) and recent active listings from Supabase; pass data as props to `HomeClient`; wrap fetches in try/catch returning empty arrays on error
    - _Requirements: 12.1, 12.3, 12.4_
  - [x] 6.2 Create `app/home/HomeClient.tsx` (Client Component) — reads `isVerified` from `useAuthStore`; renders `VerificationBanner` + `LockedHome` when unverified, `VerifiedHome` when verified
    - _Requirements: 6.1, 6.7, 13.14_
  - [x] 6.3 Create `app/home/VerificationBanner.tsx` — top banner with "Your account verification is pending" message and "Complete Verification" CTA linking to `/account`; only rendered when `isVerified` is false
    - _Requirements: 6.6_
  - [x] 6.4 Create `app/home/LockedHome.tsx` — full-screen card with "Verification Required" title, descriptive message, "Complete Verification" CTA to `/account`, lock icons on Buy/Sell/Chat/Dashboard sections, and disabled `ModeToggle`
    - _Requirements: 6.2, 6.3, 6.4_
  - [ ]* 6.5 Add blurred teaser overlay behind the verification card in `LockedHome.tsx`
    - Render a blurred preview of marketplace content (static or fetched) behind the card using `filter: blur` and `pointer-events: none`
    - _Requirements: 6.5_
  - [x] 6.6 Create `components/ModeToggle.tsx` — sliding Buy/Sell toggle with cart/tag icons, smooth ease-in-out animation, `disabled` prop that prevents interaction; calls `setSelectedMode` and navigates to `/buy` or `/sell` on selection; skips navigation if already on the target route
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 7.8, 7.9_
  - [x] 6.7 Create `app/home/VerifiedHome.tsx` — renders `ModeToggle` (active), helper text based on selected mode, `TrendingSection`, `QuickCategories`, `RecentSection`; fully responsive (min 320px)
    - _Requirements: 7.1, 7.4, 7.5, 12.5_
  - [x] 6.8 Create `app/home/TrendingSection.tsx` — displays up to 6 `ProductCard` components with lazy-loaded images; shows skeleton UI while loading; empty state on error
    - _Requirements: 12.1, 12.4, 12.6_
  - [x] 6.9 Create `app/home/QuickCategories.tsx` — renders category pill links to `/buy?category={category}` using the `CATEGORIES` constant
    - _Requirements: 12.2_
  - [x] 6.10 Create `app/home/RecentSection.tsx` — displays active listings ordered by `created_at desc`; lazy-loaded images; skeleton UI while loading
    - _Requirements: 12.3, 12.4, 12.6_
  - [ ]* 6.11 Write property tests for home page rendering (Properties 13, 14, 22, 23)
    - **Property 13: Home page renders locked view for unverified users**
    - **Property 14: Home page renders full view for verified users**
    - **Property 22: Trending section shows at most 6 products**
    - **Property 23: Recent listings are ordered by creation date descending**
    - **Validates: Requirements 6.1, 6.6, 6.7, 7.1, 12.1, 12.3**
    - File: `__tests__/property/homeExperience.property.test.ts`

- [x] 7. Navbar updates — Home link, active state, unverified dot
  - [x] 7.1 Update `components/Navbar.tsx`:
    - Add `isVerified` from `useAuthStore`
    - Insert "Home" link to `/home` as the first nav item after the logo (desktop and mobile)
    - Reorder links: Home, Buy, Sell, Chat, Dashboard/Admin, Profile
    - Apply active style using the existing `active()` helper for all links including `/home`
    - Render a small indicator dot on the "Sell" link when `isLoggedIn && !isVerified`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ]* 7.2 Write property tests for Navbar (Properties 18, 19)
    - **Property 18: Navbar active state matches current route**
    - **Property 19: Unverified dot indicator on Sell link**
    - **Validates: Requirements 9.3, 9.4**
    - File: `__tests__/property/authFlow.property.test.ts`

- [x] 8. Profile page — verification badge
  - [x] 8.1 Create `components/VerificationBadge.tsx` — renders "Verified" (green) or "Unverified" (gray/red) badge; when unverified, includes a tooltip with "Complete verification to publish listings"
    - _Requirements: 10.4, 10.5_
  - [x] 8.2 Update `app/profile/page.tsx` — replace the inline `is_verified` span with `<VerificationBadge isVerified={profile?.is_verified} />` near the user's name/avatar
    - _Requirements: 10.4, 10.5_
  - [ ]* 8.3 Write property test for profile verification badge (Property 20)
    - **Property 20: Profile page verification badge reflects status**
    - **Validates: Requirements 10.4, 10.5**
    - File: `__tests__/property/authFlow.property.test.ts`

- [x] 9. Sell page — publish guard popup for unverified users
  - [x] 9.1 Update `app/sell/page.tsx` — read `isVerified` from `useAuthStore`; in `handleSubmit`, if `!isVerified`, show a modal/popup with "Verification required to publish listings" and abort the insert; if verified, proceed with `is_active: true`
    - _Requirements: 8.1, 8.2_
  - [ ]* 9.2 Write property tests for sell guard (Properties 16, 17)
    - **Property 16: Unverified users cannot publish listings**
    - **Property 17: Verified users publish listings as active**
    - **Validates: Requirements 8.1, 8.2**
    - File: `__tests__/property/sellGuard.property.test.ts`

- [ ] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Admin User Management — extended UsersTable
  - [x] 11.1 Update `app/admin/users/page.tsx` — extend the Supabase select query to include `full_name`, `username`, `company_name`, `whatsapp_number`; pass updated data to `UsersTable`
    - _Requirements: 13.1, 13.2_
  - [x] 11.2 Update `app/admin/users/UsersTable.tsx`:
    - Add columns: Full Name, WhatsApp/Phone, Company/Shop Name, Username, Member Since; keep Verification Status and Account Status
    - Update search to filter by `full_name`, `email`, or `company_name` (case-insensitive, client-side)
    - Add filter controls for Verification Status (Verified / Unverified) and Account Status (Active / Suspended)
    - Add "Mark as Verified" action → PATCH `is_verified: true`, `verification_status: "approved"`
    - Add "Mark as Unverified" action → PATCH `is_verified: false`, `verification_status: "pending"`
    - Rename/repurpose existing Block button to "Suspend Account" / "Activate Account" (already sets `is_blocked`)
    - Add "Send Email" quick action → `mailto:{email}` link
    - Add "Contact on WhatsApp" quick action → `https://wa.me/{whatsapp_number}` in new tab (only when `whatsapp_number` is set)
    - _Requirements: 13.2, 13.3, 13.4, 13.6, 13.7, 13.8, 13.9, 13.10, 13.11_
  - [ ]* 11.3 Add CSV export button to `UsersTable.tsx` — exports the current filtered user list as a CSV file using client-side serialisation
    - _Requirements: 13.13_
  - [ ]* 11.4 Write property tests for admin user management (Properties 25, 26, 27)
    - **Property 25: Admin user search filters correctly**
    - **Property 26: Verify/unverify round-trip**
    - **Property 27: Suspend/activate round-trip**
    - **Validates: Requirements 13.3, 13.4, 13.6, 13.7, 13.8, 13.9**
    - File: `__tests__/property/adminUsers.property.test.ts`

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations per property
- Each property test file includes the comment tag `// Feature: home-experience-auth-flow, Property N: <property text>`
- The sell-page publish guard is a UX layer; Supabase RLS remains the authoritative security gate
- The blurred teaser (task 6.5) and CSV export (task 11.3) are optional enhancements
