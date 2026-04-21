# Phase 3 — Cookbooks

## Goal

Users can create cookbooks and organize their recipes into them. Cookbooks are publicly browsable and searchable.

## Scope

### Cookbook data model
- Name, description
- Owner (linked to user account)
- Collection of recipes
- Created/updated timestamps

### Cookbook CRUD (authenticated users)
- Create a new cookbook
- View own cookbooks
- Edit a cookbook they own
- Delete a cookbook they own

### Adding recipes to cookbooks
- A user can add any recipe they own to a cookbook they own
- A user can remove a recipe from a cookbook they own

### Public cookbook browsing (all users)
- Browse all public cookbooks
- View a single public cookbook and its recipes (public recipes only visible to guests)

### Cookbook search
- Unauthenticated users: search across public cookbooks
- Authenticated users: search across public cookbooks and cookbooks they own

## Open questions
- ~~What determines if a cookbook is public vs private?~~ **Resolved:** defaults to private, matching recipe behavior. The `is_public` checkbox is on the create/edit form.

## Out of scope
- Adding cookbooks to families (Phase 4)
- Family-editable cookbooks (Phase 5)

---

## Progress

### ✅ Cookbook data model — complete
- `cookbooks` table with `name`, `description`, `is_public` (default `false`), `created_by`, `created_at`
- `cookbook_tags` join table linking cookbooks to tags
- `cookbook_recipes` join table linking cookbooks to recipes
- RLS policies applied (see `database-schema.md`)

### ✅ Cookbook CRUD (authenticated users) — complete
- **Create** — `/dashboard/cookbooks/new`: form with name (required), description, tags, public/private toggle
- **View own cookbooks** — `/dashboard`: lists only your cookbooks as cards with public/private badge. Includes a "Browse all cookbooks" link.
- **View a single cookbook** — `/dashboard/cookbooks/[id]`: shows name, description, public/private badge, creator attribution, tags, and the list of recipes in the cookbook. Edit and Delete buttons are shown to the owner only. Non-owners see only recipes accessible to them (RLS on `recipes` filters private recipes for non-owners).
- **Edit** — `/dashboard/cookbooks/[id]/edit`: pre-filled form, only accessible to owner (404 otherwise); syncs tags on save
- **Delete** — `/dashboard/cookbooks/[id]`: confirmation dialog before deletion (only owner can trigger); redirects to dashboard
- Server actions in `app/dashboard/cookbooks/actions.ts`

### ✅ Cookbook visibility toggle — complete
- `is_public` checkbox on create and edit forms
- Public/Private badge on cookbook cards and detail page

### ✅ Public cookbook browsing (authenticated users) — complete
- `/dashboard/cookbooks` — browse all accessible cookbooks (own + public community cookbooks), ordered by creation date
- `/dashboard/cookbooks/[id]` — single cookbook detail page; RLS enforces access (public cookbooks visible to all authenticated users)
- `CookbookCard` component with `creatorName` prop for attribution on community cookbooks

### ✅ Creator attribution on cookbook cards and detail pages
- Cookbook cards show "Your cookbook" in `text-accent/70` for owned cookbooks; creator's display name in `text-muted-foreground` for others
- Cookbook detail page shows the same byline below the title

### ✅ Cookbook tags — complete
- Reuses the shared `tags` table and `TagInput` component from Phase 2
- `cookbook_tags` join table; `syncCookbookTags` helper in `actions.ts` replaces all tags on create/update
- Tags shown on cookbook cards and detail page as Badge pills

### ✅ Adding / removing recipes from cookbooks — complete
- **Add recipe to cookbook (cookbook page):** On the cookbook detail page, owners see an inline "＋ Add Recipe" toggle panel in the Recipes section. It renders a search input that filters the user's eligible recipes (owned, not already in the cookbook). Clicking a recipe adds it immediately with a loading state via `useTransition`.
- **Remove recipe from cookbook:** Each recipe on the cookbook detail page (owner view) has a "Remove" button that opens a confirmation dialog before calling `removeRecipeFromCookbook`.
- **Add recipe to cookbook (recipe page):** On the recipe detail page, owners see an "Add to cookbook" dropdown button (with `BookPlus` icon) listing their cookbooks that don't already contain this recipe. Selecting one adds it and shows a success toast notification ("Added to '[cookbook name]'") in the top-right corner.
- Server actions `addRecipeToCookbook` and `removeRecipeFromCookbook` in `app/dashboard/cookbooks/actions.ts` — both validate cookbook ownership and use `revalidatePath` to refresh the page in place.
- Eligible recipes are currently defined as **recipes the user owns** (see `requirements.md` note).
- Toast notifications use `sonner` (shadcn component at `components/ui/sonner.tsx`); `<Toaster position="top-right" />` is mounted in the dashboard layout.

### 🔲 Show which cookbooks a recipe belongs to — future feature
- On the recipe detail page, display which cookbooks the recipe has been added to
- Note: the definition of "eligible recipes" (recipes a user can add to a cookbook) is currently recipes the user owns; this will need to be revisited when families are implemented (Phase 4)

### 🔲 Cookbook search — not yet implemented
- Unauthenticated users: search across public cookbooks
- Authenticated users: search across public + own cookbooks
