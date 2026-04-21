# Phase 2 — Recipes

## Goal

Users can create, view, edit, and delete their own recipes. Recipes can be marked public or private. Unauthenticated users can browse and search public recipes.

## Scope

### Recipe data model
- Title (required), description, ingredients (required), instructions (required)
- Owner (linked to user account)
- Visibility: public or private (default private)
- Created/updated timestamps

### Recipe CRUD (authenticated users)
- Create a new recipe
- View own recipes
- Edit a recipe they own
- Delete a recipe they own

### Recipe visibility
- Owner can toggle a recipe between public and private
- Private recipes are only visible to their owner

### Public recipe browsing (all users)
- Browse all public recipes
- View a single public recipe

### Recipe search
- Unauthenticated users: search across public recipes only
- Authenticated users: search across public recipes and recipes they own

## Out of scope
- Adding recipes to cookbooks (Phase 3)
- Adding recipes to families (Phase 4)
- Family-editable recipes (Phase 5)
- Recipe sharing link (Phase 5)

---

## Progress

### ✅ Recipe data model — complete
- `recipes` table with `title`, `description`, `ingredients`, `instructions`, `is_public`, `created_by`, `created_at`
- `created_by` references `public.profiles.id` (not `auth.users` directly)
- RLS policies applied (see `database-schema.md`)

### ✅ Recipe CRUD (authenticated users) — complete
- **Create** — `/dashboard/recipes/new`: form with title (required), description, ingredients (required), instructions (required), public/private toggle
- **View own recipes** — `/dashboard`: lists all accessible recipes (own + public) as cards with public/private badge
- **Edit** — `/dashboard/recipes/[id]/edit`: pre-filled form with same required fields, only accessible to owner
- **Delete** — `/dashboard/recipes/[id]`: confirmation dialog before deletion, only accessible to owner
- Server actions in `app/dashboard/recipes/actions.ts`

### ✅ Recipe visibility toggle — complete
- `is_public` checkbox on create and edit forms
- Badge on recipe cards and detail page shows Public/Private status

### ✅ Dashboard home page — complete
- Authenticated home page at `/dashboard` (was `/protected`)
- Recipe list with skeleton loading state (Partial Prerendering)
- "Add Recipe" button links to `/dashboard/recipes/new`
- Empty state with prompt to add first recipe

### ✅ Public recipe browsing (unauthenticated users)
- `/recipes` — grid listing of all `is_public = true` recipes with loading skeleton
- `/recipes/[id]` — recipe detail page showing title, description, ingredients, and instructions; returns 404 for private or missing recipes
- Proxy allows `/recipes/*` through without authentication
- Shared layout (`app/recipes/layout.tsx`) with same nav/footer as dashboard; shows Sign in / Sign up buttons and theme switcher for guests, user menu for authenticated users
- `BrandLogo` links to `/` (welcome page) for guests; dashboard layout passes `href="/dashboard"` explicitly

### 🔲 Recipe search
- Not yet implemented
