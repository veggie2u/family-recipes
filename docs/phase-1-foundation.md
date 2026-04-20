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
