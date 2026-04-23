# Team Workstreams — Phase 6 + Route Refactor

## Overview

The remaining implementation work is split across four parallel streams. Streams A and B can begin immediately. Streams C and D begin once their dependencies are merged.

---

## Dependency order

```
Stream A (DB)  ──────────────────────────────────┐
                                                  ├──► Stream C (Feed UI)
Stream B (Routing)  ──────────────────────────────┘

Stream A (DB)  ──────────────────────────────────► Stream D (Social UI)
```

---

## Stream A — Database: Phase 6 Data Model

**Start:** Immediately  
**Status: ✅ Complete**  
**Unblocks:** Streams C and D  
**Reference docs:** `phase-6-feed.md`, `phase-4-families.md`

### Deliverables

#### `family_followers`
- `id uuid PK`, `family_id uuid → families`, `user_id uuid → profiles`, `followed_at timestamptz`
- Unique constraint on `(family_id, user_id)` (implicit index covers family-based queries)
- Additional index on `user_id` for reverse lookup ("what families does user X follow?")
- RLS: `SELECT` all (public follower counts), `INSERT`/`DELETE` own row only

#### `cookbook_follows`
- `id uuid PK`, `cookbook_id uuid → cookbooks`, `user_id uuid → profiles`, `followed_at timestamptz`
- Unique constraint on `(cookbook_id, user_id)` (implicit index covers cookbook-based queries)
- Additional index on `user_id` for reverse lookup — no redundant `cookbook_id` index
- RLS: `SELECT` all (public follow counts), `INSERT`/`DELETE` own row only

#### `recipe_bookmarks` *(originally spec'd as `recipe_saves`)*
- `id uuid PK`, `recipe_id uuid → recipes`, `user_id uuid → profiles`, `bookmarked_at timestamptz`
- Unique constraint on `(recipe_id, user_id)`
- Index on `(user_id, bookmarked_at DESC)` — primary access pattern for `/bookmarks` page
- RLS: `SELECT`/`INSERT`/`DELETE` own rows only (bookmarks are private)

#### `feed_events`
- `id uuid PK`, `event_type text` (`recipe_created` | `recipe_added_to_family` | `recipe_added_to_cookbook` | `cookbook_created` | `cookbook_added_to_family`), `recipe_id uuid → recipes (nullable)`, `actor_id uuid → profiles`, `family_id uuid → families (nullable)`, `cookbook_id uuid → cookbooks (nullable)`, `created_at timestamptz`
- Postgres triggers populate this table on INSERT into `recipes`, `family_recipes`, `cookbook_recipes`, `cookbooks`, `family_cookbooks`
- `recipe_id` is nullable — cookbook events have no associated recipe
- `family_cookbooks.added_by uuid` column added to track actor for cookbook-to-family events
- Indexes on `created_at DESC`, `recipe_id`, `actor_id`, `family_id`, `cookbook_id`
- RLS: `SELECT` for `authenticated` only; no INSERT/DELETE from app (triggers only)

#### `get_feed()` Postgres function
- Signature: `get_feed(p_user_id uuid, p_cursor timestamptz, p_limit int, p_filter text)`
- `p_filter` values: `'all'` | `'families'` | `'following'` | `'public'`; defaults to `'all'`
- Returns ranked `feed_events` joined with recipe/actor/family/cookbook data including `cookbook_desc`
- Recipe columns (`recipe_title`, `recipe_desc`, `recipe_is_public`) are `NULL` for cookbook events
- Cookbook events visible if `cookbook.is_public = true` or caller is actor/active family member
- Uses LEFT JOIN on recipes (was inner JOIN) to support cookbook-only events

### Checklist
- [x] `family_followers` migration + RLS
- [x] `cookbook_follows` migration + RLS
- [x] `recipe_bookmarks` migration + RLS
- [x] `feed_events` migration + triggers + indexes + RLS
- [x] `get_feed()` function
- [x] Run `supabase-get_advisors` (security + performance) after migrations
- [x] *(bonus)* `fix_feed_functions_search_path_and_indexes` — `SET search_path = ''` on all 4 functions; added missing FK indexes on `feed_events(family_id)` and `feed_events(cookbook_id)`
- [x] `cookbook_created` + `cookbook_added_to_family` event types + triggers
- [x] `feed_events.recipe_id` made nullable; `family_cookbooks.added_by` added
- [x] `get_feed()` updated for cookbook events (LEFT JOIN, `cookbook_desc`, cookbook visibility)
- [x] Backfill cookbook feed events (7 `cookbook_created`, 3 `cookbook_added_to_family`)

---

## Stream B — Routing: Route Architecture Refactor

**Start:** Immediately  
**Unblocks:** Stream C  
**Reference docs:** `requirements.md` (UX / Navigation section), `permissions.md`

### Deliverables

- **`/feed`** — new top-level route accessible to both personas (no `/dashboard/` prefix)
  - `app/(public)/feed/page.tsx` — shell; unauthenticated users see public content
- **`/bookmarks`** — protected route (authenticated only)
  - `app/(auth)/bookmarks/page.tsx` — shell; redirect to login if unauthenticated
- **`/profile/[userId]`** — public user profile page
  - `app/(public)/profile/[userId]/page.tsx`
- **Middleware update** — add `/bookmarks` to the list of protected routes
- **Post-login redirect** — change from `/dashboard` → `/feed`
- **Nav link updates** — in the dashboard layout, update "Recipes", "Cookbooks", "Families" nav items to link to `/feed` with the appropriate filter query param (e.g. `?filter=recipes`), not standalone listing pages
- **Remove or alias `/dashboard/families`** — keep existing pages working during transition; `/families/[id]` can alias `/dashboard/families/[id]` via a redirect if needed

### Key files
- `app/(public)/feed/page.tsx` (new)
- `app/(auth)/bookmarks/page.tsx` (new)
- `app/(public)/profile/[userId]/page.tsx` (new)
- `middleware.ts`
- `app/dashboard/layout.tsx` (nav + post-login redirect)

### Checklist
- ✅ `/feed` route (shell)
- ✅ `/bookmarks` route (protected shell)
- ✅ `/profile/[userId]` route (public shell)
- ✅ Middleware updated for new protected routes
- ✅ Post-login redirect changed to `/feed`
- ✅ Nav links updated to feed-filter model (`AppNav` component shared across all layouts)

---

## Stream C — Feed UI: /feed Page

**Start:** After Streams A and B are merged  
**Status: ✅ Complete**  
**Depends on:** Stream A (`feed_events`, `get_feed()`), Stream B (`/feed` route exists)  
**Reference docs:** `phase-6-feed.md`, `requirements.md` (Feed section)

### Deliverables

- **Filter controls** — source selector at the top of the feed
  - Options for authenticated users: All / My Families / Following / Public
  - Unauthenticated users: no filter controls (public content only)
- **`FeedCard` component** — displays:
  - Recipe title (link to `/recipes/:id`), description excerpt
  - Source context ("Added to *Smith Family* by *Grandma Rose*")
  - Relative timestamp via `date-fns` `formatDistanceToNow`
  - Bookmark button (authenticated users only)
  - Tags
- **Infinite scroll** — `IntersectionObserver` triggers next-page fetch; cursor is last event's `created_at`
- **Server action** — `getFeed()` in `app/(public)/feed/actions.ts` wraps `get_feed()` RPC + batch tag query
- **Empty states** — per filter, with contextual CTAs (e.g. "Follow a family to see their recipes here")
- **Loading skeleton** — shown while next page loads
- **Create dropdown** — authenticated users see a "Create" button (Recipe / Cookbook / Family) in the feed header

### Key files
- `app/(public)/feed/page.tsx` (updated — real data, `FeedHeader` with create button)
- `app/(public)/feed/actions.ts` (new — `getFeed()` server action + `FeedEvent` type)
- `components/feed-card.tsx` (new)
- `components/feed-list.tsx` (new — `"use client"` infinite scroll)
- `components/bookmark-button.tsx` (new — implemented here; Stream D will extend)
- `app/(auth)/bookmarks/actions.ts` (new — `bookmarkRecipe`, `removeBookmark`)
- `components/create-dropdown.tsx` (new)
- `components/back-button.tsx` (new — `router.back()` used app-wide)

### Checklist
- ✅ Filter control component
- ✅ `FeedCard` component (recipe events + cookbook events)
- ✅ Server action for `get_feed()`
- ✅ Infinite scroll with IntersectionObserver
- ✅ Unauthenticated public view
- ✅ Empty states per filter
- ✅ Loading skeleton
- ✅ Bookmark button on feed cards
- ✅ Create dropdown (Recipe / Cookbook / Family)
- ✅ Back button (`router.back()`) used on all detail/edit/new pages
- ✅ Cookbook feed events (`cookbook_created`, `cookbook_added_to_family`) rendered in feed
- ✅ AppNav links fixed: Recipes → `/recipes`, Cookbooks → `/cookbooks`, Families → `/families`
- ✅ "My stuff" section in UserMenu (My Recipes / My Cookbooks / My Families)
- ✅ Public `/cookbooks` listing page (`app/cookbooks/`)

### DB note
A `backfill_feed_events` migration was applied to populate `feed_events` for all data that existed before the triggers were created (29 `recipe_created`, 20 `recipe_added_to_cookbook`, 1 `recipe_added_to_family`).

---

## Stream D — Social Features: Following + Bookmarks UI

**Start:** After Stream A is merged (can use mock server actions before A lands)  
**Depends on:** Stream A (`family_followers`, `cookbook_follows`, `recipe_bookmarks` tables)  
**Reference docs:** `requirements.md` (Following, Bookmarks sections), `phase-6-feed.md`

### Deliverables

#### Following
- **`FollowButton` component** (`components/follow-button.tsx`)
  - Props: `type: 'family' | 'cookbook'`, `targetId`, `initialFollowing`, `followerCount`
  - Optimistic toggle with rollback on error
  - Used on family detail page, cookbook detail page, and cookbook cards
- **Server actions** — `followFamily`, `unfollowFamily`, `followCookbook`, `unfollowCookbook` in relevant `actions.ts` files
- **Follower count** — displayed on family and cookbook detail pages + cookbook cards

#### Bookmarks
- **`BookmarkButton` component** (`components/bookmark-button.tsx`)
  - Optimistic toggle; shows filled/outline bookmark icon
  - Used on: feed cards, recipe cards, recipe detail page, cookbook detail page (per-recipe), family detail page (per-recipe)
- **Server actions** — `bookmarkRecipe`, `removeBookmark` in `app/(auth)/bookmarks/actions.ts`
- **`/bookmarks` page** — grid of saved recipes, most recently saved first; filter by tag; remove bookmark button per card

### Key files
- `components/follow-button.tsx` (new)
- `components/bookmark-button.tsx` (new)
- `app/(auth)/bookmarks/page.tsx`
- `app/(auth)/bookmarks/actions.ts` (new)
- `app/dashboard/families/[id]/page.tsx` (add FollowButton)
- `app/dashboard/cookbooks/[id]/page.tsx` (add FollowButton + per-recipe BookmarkButton)

### Checklist
- [ ] `FollowButton` component + server actions (family)
- [ ] `FollowButton` component + server actions (cookbook)
- [ ] Follower count on family + cookbook pages
- ✅ `BookmarkButton` component (`components/bookmark-button.tsx`) — implemented in Stream C
- ✅ `bookmarkRecipe` / `removeBookmark` server actions (`app/(auth)/bookmarks/actions.ts`) — implemented in Stream C
- ✅ BookmarkButton on feed cards — implemented in Stream C
- [ ] BookmarkButton on recipe detail, cookbook detail, family detail
- [ ] `/bookmarks` page with tag filter
- [ ] Remove bookmark from `/bookmarks` page

---

## Coordination notes

- Stream D's `BookmarkButton` will be used inside Stream C's `FeedCard`. Coordinate the component interface early so Stream C can import it as soon as Stream D ships it.
- Stream B creates the `/bookmarks` page shell; Stream D fills in the content.
- All new forms must use **react-hook-form + shadcn Form** per Frontend Standards in `requirements.md`.
- All async actions must show feedback via **sonner** toasts (`toast.success` / `toast.error`).
- Use `(select auth.uid())` in all new RLS policies (not bare `auth.uid()`) per the performance fix already applied to existing tables.
