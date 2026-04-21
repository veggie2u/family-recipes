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
- **View own recipes** — `/dashboard`: lists only your recipes as cards with public/private badge. To browse all accessible recipes (your recipes + public/community recipes), visit `/dashboard/recipes`.
- **Edit** — `/dashboard/recipes/[id]/edit`: pre-filled form with same required fields, only accessible to owner
- **Delete** — `/dashboard/recipes/[id]`: confirmation dialog before deletion, only accessible to owner
- Server actions in `app/dashboard/recipes/actions.ts`

### ✅ Recipe visibility toggle — complete
- `is_public` checkbox on create and edit forms
- Badge on recipe cards and detail page shows Public/Private status

### ✅ Dashboard home page — complete
- Authenticated home page at `/dashboard` (was `/protected`) showing "My Recipes" (your recipes only)
- Header includes a "Browse all recipes" link to `/dashboard/recipes` and an "Add Recipe" button
- Recipe list with skeleton loading state (Partial Prerendering)
- Empty state with prompt to add first recipe

### ✅ Public recipe browsing (unauthenticated users)
- `/recipes` — grid listing of all `is_public = true` recipes with loading skeleton
- `/recipes/[id]` — recipe detail page showing title, description, ingredients, and instructions; returns 404 for private or missing recipes
- Proxy allows `/recipes/*` through without authentication
- Shared layout (`app/recipes/layout.tsx`) with same nav/footer as dashboard; shows Sign in / Sign up buttons and theme switcher for guests, user menu for authenticated users
- `BrandLogo` links to `/` (welcome page) for guests; dashboard layout passes `href="/dashboard"` explicitly

### ✅ Recipe search
- `RecipeSearchInput` client component with 300ms debounce updates `?q=` URL param
- Filters on title and description using case-insensitive `ilike`
- Guest `/recipes` page: searches public recipes only
- Authenticated `/dashboard` page: searches only your recipes (filtered to recipes you created)
- `/dashboard/recipes` page: searches all accessible recipes (own + public + family, per RLS)
- Empty state distinguishes between "no results for query" and "no recipes yet"
- **Bug fix:** `searchParams` was in the `useEffect` dependency array, causing an infinite GET request loop on page load. Fixed by storing `searchParams` in a ref so the effect only re-runs when the user's typed `value`, `pathname`, or `router` changes.

### ✅ Reusable recipe components
- **`components/recipe-card.tsx`** — shared card used on both `/recipes` and `/dashboard`. Props: `id`, `title`, `description`, `isOwner?`, `creatorName?`, `isPublic?` (omit to hide the badge), `href?` (defaults to `/dashboard/recipes/:id`), `tags?`.
- **`components/recipe-detail.tsx`** — shared detail view used on both `/recipes/[id]` and `/dashboard/recipes/[id]`. Props: `title`, `description`, `ingredients`, `instructions`, `isOwner?`, `creatorName?`, `isPublic?` (omit to hide the badge), `tags?`, `actions?` (render slot for Edit/Delete buttons).

### ✅ Creator attribution on recipe cards and detail pages
- Recipe cards and detail pages show a byline below the title indicating who created the recipe
- "Your recipe" is shown in `text-accent/70` when the viewer owns the recipe
- The creator's display name (from `profiles.name`) is shown in `text-muted-foreground` for all other recipes
- Unauthenticated viewers always see the creator's name
- Both `/recipes` and `/dashboard` join `profiles(name)` in their Supabase query; the current user's ID is compared against `created_by` to determine ownership

### ✅ Recipe tags
- `tags` table (id, name) with `CHECK (name = lower(name))` constraint — tags stored lowercase
- `recipe_tags` join table linking recipes to tags, with RLS policies
- `TagInput` component: autocomplete from existing tags, create new tags inline, removable badge pills, keyboard support
- Tags shown on recipe cards (dashboard + public listing) as Badge pills
- Tags shown on recipe detail pages (dashboard + public)
- Server actions sync tags on create and update
