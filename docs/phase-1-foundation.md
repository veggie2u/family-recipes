# Phase 1 — Foundation

## Goal

Establish the app shell, navigation, and all authentication flows. By the end of this phase, a user can land on a welcome page, sign up, log in, and log out.

## Scope

### Welcome page
- Public landing page visible to unauthenticated users
- Clear call-to-action to log in or sign up
- Basic branding and app description

### Navigation
- Persistent nav bar across all pages
- Shows login/signup links when logged out
- Shows user identity and logout when logged in

### Authentication
- Sign up with email and password
- Log in with email and password
- Log out
- Forgot password / password reset flow
- Email confirmation on sign up

### Post-auth redirect
- After login, redirect to a dashboard or home page for authenticated users
- After logout, redirect to the welcome page

## Out of scope
- Recipes, cookbooks, families (Phase 2+)
- Social login (not in requirements)

## Notes
- Auth is provided by Supabase; the starter kit scaffolds most of these flows under `app/auth/`
- The proxy (`proxy.ts`) already handles session refresh and redirects unauthenticated users to `/auth/login`
- Clean up or replace starter kit placeholder content (hero, tutorial steps, deploy button) as part of this phase

---

## Progress

### ✅ Welcome page — complete
- Replaced the Next.js/Supabase starter kit boilerplate entirely
- Full-screen hero with app name (`font-display` Playfair Display serif), tagline, and ornamental divider
- Two primary CTAs: "Get Started — It's Free" (→ `/auth/sign-up`) and "Sign In" (→ `/auth/login`)
- Three feature highlight cards: Preserve Heritage, Organize Together, Share & Celebrate
- Branded footer with logo wordmark
- Nav bar with `BrandLogo` component and `ThemeSwitcher`

### ✅ Branding & visual language — complete
- See [`docs/branding.md`](./branding.md) for full design decisions

### ✅ Login page — complete
- Branded shell: logo nav at top, `ThemeSwitcher`, link back to `/`
- Card copy updated: "Welcome back" / "Sign in to your Family Recipes account"

### ✅ Sign-up page — complete
- Branded shell: logo nav at top, `ThemeSwitcher`, link back to `/`
- Card copy updated: "Create an account" / "Join Family Recipes and start preserving your culinary heritage"

### 🔲 Navigation (persistent, post-auth)
- Still needed: nav bar for authenticated pages showing user identity + logout

### 🔲 Post-auth redirect
- After login → dashboard/home for authenticated users (placeholder `/protected` exists)
- After logout → welcome page

### 🔲 Remaining auth flows
- Forgot password / password reset — page exists (`/auth/forgot-password`) but needs branding pass
- Email confirmation page (`/auth/confirm`) — needs branding pass
- Sign-up success page (`/auth/sign-up-success`) — needs branding pass
