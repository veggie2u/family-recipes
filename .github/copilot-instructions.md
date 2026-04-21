# Copilot Instructions

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

Next.js 15 App Router application using Supabase for auth and data, Tailwind CSS for styling, and shadcn/ui for components.

### Supabase client pattern

There are **three** Supabase clients — use the right one for the context:

- `lib/supabase/client.ts` — browser/client components (`createBrowserClient`)
- `lib/supabase/server.ts` — server components and route handlers (`createServerClient` + cookies)
- `lib/supabase/proxy.ts` — session refresh in the proxy; **do not add logic between `createServerClient` and `supabase.auth.getClaims()`**

**Never store a Supabase client in a module-level or global variable.** Always instantiate inside the function (Fluid compute requirement). The server client is `async` — always `await createClient()`.

### Proxy (not middleware)

Session refresh runs in `proxy.ts` at the project root (not `middleware.ts`). It calls `supabase.auth.getClaims()` on every request to keep sessions alive and redirects unauthenticated users to `/auth/login` for any path that isn't `/` or `/auth/*`.

If you modify the proxy response, you **must** copy cookies from `supabaseResponse` to the new response object or users will be randomly logged out.

### Auth routes

All auth UI lives under `app/auth/`: `login`, `sign-up`, `forgot-password`, `update-password`, `confirm`, `error`, `sign-up-success`.

### Protected routes

`app/protected/` requires authentication. The proxy handles the redirect; individual pages still call `supabase.auth.getClaims()` and redirect on error as a defense-in-depth measure.

## Key conventions

- **Wrap async server components in `<Suspense>`** — any server component that does uncached async fetching (e.g., Supabase queries) must be extracted into a child component and wrapped with `<Suspense>` in the page. Fetching directly in the page component will cause a build error (`Uncached data was accessed outside of <Suspense>`). See `app/dashboard/profile/page.tsx` for the pattern.
- **`cn()` for all `className` values** — import from `lib/utils.ts`; it merges Tailwind classes via `clsx` + `tailwind-merge`.
- **shadcn/ui components** live in `components/ui/` and are added via the CLI (`npx shadcn@latest add <component>`), not written by hand.
- **Path alias `@/`** maps to the project root.
- **Environment variables**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the newer publishable key format; legacy anon keys also work). Copy `.env.example` → `.env.local` to get started.
- `hasEnvVars` in `lib/utils.ts` gates tutorial UI — it is safe to remove once the project is configured.
- `cacheComponents: true` is set in `next.config.ts`.
