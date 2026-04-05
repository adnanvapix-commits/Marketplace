# Requirements Document

## Introduction

This feature transforms the marketplace app's UX by making the Home page the central decision hub for authenticated users. It introduces a Buy/Sell mode toggle as the primary navigation mechanism, enforces a strict verification-gated access model (unverified users see a locked Home experience and cannot access /buy, /sell, /chat, or /dashboard), updates the registration flow to collect Full Name and WhatsApp number while removing role selection, adds auth guards to prevent logged-in users from accessing /login and /register, auto-generates user avatars from initials, extends the Zustand auth store, improves the Navbar with a Home link and verification indicators, and adds a comprehensive User Management section to the Admin panel.

The app is built with Next.js 14, Supabase (auth + database), Zustand (state management), and Tailwind CSS.

---

## Glossary

- **App**: The Next.js 14 B2B marketplace application.
- **Auth_System**: The Supabase authentication layer (sign-in, sign-up, session management).
- **Auth_Guard**: Middleware or client-side logic that prevents authenticated users from accessing /login or /register.
- **Home_Page**: The `/home` route that serves as the post-login decision hub.
- **Mode_Toggle**: The interactive Buy/Sell sliding toggle component on the Home page.
- **Auth_Store**: The Zustand store (`authStore.ts`) managing user session, verification status, selected mode, role, profile completion, and last visited page.
- **Verification_Banner**: The top-of-page banner shown to unverified users indicating pending verification.
- **Locked_Home**: The restricted Home page view shown to Unverified_Users, featuring a full-screen verification card, lock icons, and disabled navigation.
- **Navbar**: The sticky top navigation component (`Navbar.tsx`).
- **Registration_Form**: The sign-up section of the login page (`/login`).
- **Middleware**: The Next.js middleware (`lib/supabase/middleware.ts`) that enforces route-level access control.
- **Unverified_User**: A user whose `is_verified` field in the `users` table is `false`.
- **Verified_User**: A user whose `is_verified` field in the `users` table is `true`.
- **Avatar**: A generated circular image displaying the user's initials, used when no profile photo is set.
- **Admin_User_Management**: The `/admin/users` section of the admin panel for viewing and managing all registered users.
- **Draft_Mode**: A listing state where the product is saved but `is_active` is set to `false`.

---

## Requirements

### Requirement 1: Post-Login Redirect to Home

**User Story:** As a user, I want to be redirected to the Home page after logging in, so that I can choose my next action from a central hub.

#### Acceptance Criteria

1. WHEN a non-admin user successfully authenticates via the login form, THE Auth_System SHALL redirect the user to `/home`.
2. WHEN an admin user successfully authenticates, THE Auth_System SHALL redirect the admin user to `/admin`.
3. THE Auth_System SHALL NOT redirect any non-admin authenticated user to `/profile`, `/pending`, `/subscribe`, or `/dashboard` after login.
4. IF the login attempt fails due to invalid credentials, THEN THE Auth_System SHALL display an inline error message and keep the user on the `/login` page.

---

### Requirement 2: Post-Registration Redirect and Default Status

**User Story:** As a new user, I want my account to be created with a default "Unverified" status and be redirected to the Home page, so that I can start exploring the platform immediately while verification is pending.

#### Acceptance Criteria

1. WHEN a new user completes registration, THE Auth_System SHALL create a user record with `is_verified: false` and `verification_status: "pending"`.
2. WHEN a new user completes registration, THE Auth_System SHALL redirect the user to `/home`.
3. THE Registration_Form SHALL assign both buyer and seller roles to every new user by default, without requiring the user to select a role.
4. THE Auth_System SHALL NOT redirect a newly registered user to `/pending`, `/subscribe`, or `/profile` automatically.

---

### Requirement 3: Registration Form Fields and Avatar Generation

**User Story:** As a new user, I want a clean registration form that collects my essential contact details and automatically creates my avatar, so that I can sign up quickly with a complete profile.

#### Acceptance Criteria

1. THE Registration_Form SHALL include a required Full Name field.
2. THE Registration_Form SHALL include a required Email field.
3. THE Registration_Form SHALL include a required Password field with a minimum length of 6 characters.
4. THE Registration_Form SHALL include a required WhatsApp Number field accepting a valid phone number format.
5. THE Registration_Form SHALL include an optional Company / Shop Name field.
6. THE Registration_Form SHALL NOT include a Buy/Sell role selection step.
7. IF the user submits the Registration_Form with any required field empty, THEN THE Registration_Form SHALL display a validation error for each missing required field and prevent form submission.
8. WHEN a new user completes registration, THE Auth_System SHALL auto-generate an Avatar using the user's initials derived from the Full Name field and store the avatar reference in the user record.

---

### Requirement 4: Auth Guard — Prevent Authenticated Access to Auth Routes

**User Story:** As a logged-in user, I want to be redirected away from the login and register pages, so that I don't accidentally re-authenticate or see irrelevant screens.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to `/login`, THE Middleware SHALL redirect the user to `/home`.
2. WHEN an authenticated user navigates to `/register`, THE Middleware SHALL redirect the user to `/home`.
3. WHILE a user is not authenticated, THE Middleware SHALL allow access to `/login` and `/register` without restriction.

---

### Requirement 5: Strict Verification-Gated Route Access

**User Story:** As a platform operator, I want unverified users to be blocked from core platform routes, so that only verified users can access marketplace features.

#### Acceptance Criteria

1. WHILE the authenticated user is an Unverified_User, THE Middleware SHALL redirect the user to `/home` if the user attempts to access `/buy`.
2. WHILE the authenticated user is an Unverified_User, THE Middleware SHALL redirect the user to `/home` if the user attempts to access `/sell`.
3. WHILE the authenticated user is an Unverified_User, THE Middleware SHALL redirect the user to `/home` if the user attempts to access `/chat`.
4. WHILE the authenticated user is an Unverified_User, THE Middleware SHALL redirect the user to `/home` if the user attempts to access `/dashboard`.
5. WHEN the Middleware redirects an Unverified_User from a restricted route to `/home`, THE App SHALL display a toast or inline message: "Please complete verification to access platform features".
6. WHILE the authenticated user is a Verified_User, THE Middleware SHALL allow full access to `/buy`, `/sell`, `/chat`, and `/dashboard`.
7. IF an unauthenticated user attempts to access any protected route, THEN THE Middleware SHALL redirect the user to `/login`.

---

### Requirement 6: Home Page — Locked View for Unverified Users

**User Story:** As an unverified user, I want the Home page to clearly communicate my restricted status, so that I understand what I need to do to unlock the platform.

#### Acceptance Criteria

1. WHILE the authenticated user is an Unverified_User, THE Home_Page SHALL display the Locked_Home view as the primary content.
2. THE Locked_Home SHALL display a full-screen card with the title "Verification Required", the message "Your account is under verification. Complete verification to unlock all features.", and a "Complete Verification" call-to-action button navigating to `/account`.
3. THE Locked_Home SHALL display lock icons on sections representing restricted features (Buy, Sell, Chat, Dashboard).
4. THE Locked_Home SHALL display the Mode_Toggle UI in a visually disabled state that prevents navigation to `/buy` or `/sell`.
5. WHERE a blurred marketplace preview is enabled, THE Locked_Home SHALL render a blurred teaser of marketplace content behind the verification card.
6. WHILE the authenticated user is an Unverified_User, THE Home_Page SHALL display the Verification_Banner at the top of the page with the message "Your account verification is pending" and a "Complete Verification" call-to-action button navigating to `/account`.
7. WHILE the authenticated user is a Verified_User, THE Home_Page SHALL NOT display the Locked_Home view or the Verification_Banner.

---

### Requirement 7: Home Page — Mode Toggle for Verified Users

**User Story:** As a verified authenticated user, I want a prominent Buy/Sell toggle on the Home page, so that I can quickly navigate to the Marketplace or the Create Listing page with a single interaction.

#### Acceptance Criteria

1. THE Home_Page SHALL display the Mode_Toggle as the primary visual element, centered on the page, for Verified_Users.
2. THE Mode_Toggle SHALL present two options: "Buy" (left side, default) and "Sell" (right side).
3. THE Mode_Toggle SHALL display a cart icon alongside the "Buy" label and a tag icon alongside the "Sell" label.
4. THE Home_Page SHALL display helper text "Browse products from suppliers" when the Mode_Toggle is in the "Buy" state.
5. THE Home_Page SHALL display helper text "List your products and start selling" when the Mode_Toggle is in the "Sell" state.
6. WHEN the user activates the Mode_Toggle, THE Mode_Toggle SHALL animate the transition using a smooth ease-in-out sliding motion.
7. WHEN a Verified_User selects "Buy" on the Mode_Toggle and the current route is not already `/buy`, THE Home_Page SHALL navigate the user to `/buy`.
8. WHEN a Verified_User selects "Sell" on the Mode_Toggle and the current route is not already `/sell`, THE Home_Page SHALL navigate the user to `/sell`.
9. IF the user selects a mode that matches the current active route, THEN THE Home_Page SHALL NOT trigger navigation or cause a re-render.
10. WHEN the user selects a mode, THE Auth_Store SHALL persist the selected mode to `localStorage` so that the last selected mode is restored on subsequent visits.
11. WHEN the App initializes, THE Auth_Store SHALL read `selectedMode` from `localStorage` and restore it if a previously persisted value exists.

---

### Requirement 8: Sell Flow — Publish Restriction for Unverified Users

**User Story:** As a platform operator, I want unverified users to be blocked from publishing listings, so that only verified sellers can list products publicly.

#### Acceptance Criteria

1. WHEN an Unverified_User attempts to submit the listing form on `/sell`, THE App SHALL display a popup with the message "Verification required to publish listings" and prevent the listing from being published.
2. WHEN a Verified_User submits the listing form, THE App SHALL save the listing with `is_active: true` (published) upon form submission.

---

### Requirement 9: Navbar — Home Link, Active State, and Verification Indicator

**User Story:** As a user, I want the Navbar to include a Home link as the first item, highlight the active page, and show a subtle indicator when my account has restrictions, so that I can navigate clearly and understand my status.

#### Acceptance Criteria

1. THE Navbar SHALL include a "Home" link pointing to `/home` as the first navigation item after the logo.
2. THE Navbar SHALL maintain the existing links in order: Home, Buy, Sell, Chat, Dashboard, Profile.
3. WHEN the current route matches a Navbar link's path, THE Navbar SHALL apply a distinct active visual style (primary color text and font weight) to that link.
4. WHILE the authenticated user is an Unverified_User, THE Navbar SHALL display a subtle indicator dot on the "Sell" navigation item.
5. THE Navbar SHALL NOT auto-redirect the user to Profile after any action.

---

### Requirement 10: Profile Page — Verification Status Badge

**User Story:** As a user, I want my Profile page to display my verification status, so that I can see my current standing at a glance.

#### Acceptance Criteria

1. THE App SHALL NOT automatically redirect an authenticated user to `/profile` at any point in the login or registration flow.
2. THE Navbar SHALL include a Profile link that navigates to `/profile` when clicked.
3. WHEN an unauthenticated user attempts to access `/profile`, THE Middleware SHALL redirect the user to `/login`.
4. THE Profile_Page SHALL display a verification status badge near the user's name or avatar indicating "Verified" or "Unverified".
5. WHILE the authenticated user is an Unverified_User, THE Profile_Page SHALL display a tooltip on the Unverified badge with the text "Complete verification to publish listings".

---

### Requirement 11: Auth Store — Extended Global State

**User Story:** As a developer, I want the Zustand auth store to hold all relevant user state fields, so that all components can reactively access this data without redundant API calls.

#### Acceptance Criteria

1. THE Auth_Store SHALL store the following fields: `user`, `isVerified`, `selectedMode` (`"buy"` | `"sell"`, default `"buy"`), `userRole`, `hasCompletedProfile`, and `lastVisitedPage`.
2. WHEN the Auth_Provider initializes or the auth state changes, THE Auth_Store SHALL fetch and set `isVerified`, `userRole`, and `hasCompletedProfile` from the `users` table.
3. WHEN the user selects a mode on the Mode_Toggle, THE Auth_Store SHALL update `selectedMode` and persist it to `localStorage`.
4. WHEN the App initializes, THE Auth_Store SHALL read `selectedMode` from `localStorage` and restore it if a previously persisted value exists.

---

### Requirement 12: Home Page — Discovery Sections for Verified Users

**User Story:** As a verified buyer, I want to see trending products, quick category links, and recently added listings on the Home page, so that I can discover relevant content without navigating away.

#### Acceptance Criteria

1. WHILE the Home_Page renders for a Verified_User, THE Home_Page SHALL display a "Trending Products" section showing up to 6 listings sorted by view count or recency from the `products` table.
2. WHILE the Home_Page renders for a Verified_User, THE Home_Page SHALL display a "Quick Categories" section with clickable category links that navigate to `/buy?category={category}`.
3. WHILE the Home_Page renders for a Verified_User, THE Home_Page SHALL display a "Recently Added Listings" section showing the most recently created active listings.
4. WHILE the Home_Page is loading data, THE Home_Page SHALL display skeleton placeholder UI for all discovery sections.
5. THE Home_Page SHALL be fully responsive and render correctly on mobile viewports (minimum 320px width).
6. THE Home_Page SHALL lazy-load product card images to minimize initial page load time.

---

### Requirement 13: Admin Panel — User Management

**User Story:** As an admin, I want a dedicated User Management section in the admin panel, so that I can view, search, filter, and manage all registered users from a single interface.

#### Acceptance Criteria

1. THE Admin_User_Management SHALL be accessible at the route `/admin/users` and only to users with the admin role.
2. THE Admin_User_Management SHALL display a table listing all registered users with the following columns: Full Name, Email, WhatsApp/Phone Number, Company/Shop Name, Username, Verification Status, Account Status (Active/Suspended), and Member Since (created_at).
3. THE Admin_User_Management SHALL provide a search input that filters users by Full Name, Email, or Company Name.
4. THE Admin_User_Management SHALL provide filter controls for Verification Status (Verified / Unverified) and Account Status (Active / Suspended).
5. WHEN an admin selects a user row, THE Admin_User_Management SHALL provide a "View Full Profile" action that displays the user's complete profile details.
6. THE Admin_User_Management SHALL provide a "Mark as Verified" action that sets `is_verified: true` and `verification_status: "approved"` for the selected user.
7. THE Admin_User_Management SHALL provide a "Mark as Unverified" action that sets `is_verified: false` and `verification_status: "pending"` for the selected user.
8. THE Admin_User_Management SHALL provide a "Suspend Account" action that sets `is_blocked: true` for the selected user.
9. THE Admin_User_Management SHALL provide an "Activate Account" action that sets `is_blocked: false` for the selected user.
10. THE Admin_User_Management SHALL display a "Send Email" quick action that opens a `mailto:` link pre-filled with the user's email address.
11. THE Admin_User_Management SHALL display a "Contact on WhatsApp" quick action that opens `https://wa.me/{phone_number}` in a new tab using the user's stored WhatsApp number.
12. IF a non-admin user attempts to access `/admin/users`, THEN THE Middleware SHALL redirect the user to `/home`.
13. WHERE CSV export is enabled, THE Admin_User_Management SHALL provide a button to export the current filtered user list as a CSV file.
