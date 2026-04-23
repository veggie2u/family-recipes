# Phase 6 — Recipe Feed

## Goal

Give authenticated users a personalized, scrollable feed of recipes from the communities they care about — families they belong to, families they follow, and cookbooks they've saved. Complement the feed with a "Discover" tab for surfacing trending public recipes.

---

## Design principles

- **Relationships first.** Content from families you're a _member_ of always outranks content you merely follow.
- **Recency matters, but not exclusively.** A recipe posted two weeks ago by your family should still appear above a public recipe posted an hour ago.
- **No black-box algorithm.** Users can always switch to pure chronological order or filter by source so they understand what they're seeing.
- **Infinite scroll with a cursor.** No page numbers; new items load automatically as the user scrolls, using a cursor-based pagination pattern that is stable under concurrent inserts.

---

## New concepts introduced

### Cookbook follows
Users can follow any public cookbook (similar to how they follow families). Following a cookbook surfaces new recipes added to it in the feed.

### Recipe saves (bookmarks)
Users can save/bookmark any recipe they can see. Saved recipes live in a dedicated `/dashboard/saved` page and optionally surface in feed ranking (a recipe you saved will re-surface when it gets new activity).

### Feed activity events
Rather than polling raw tables, a `feed_events` table records discrete activity. This keeps feed queries fast and makes the ranking algorithm straightforward.

---

## Scope

### Data model additions

#### `cookbook_follows`
- `id`, `cookbook_id` (FK → cookbooks), `user_id` (FK → profiles), `followed_at`
- Unique constraint on `(cookbook_id, user_id)`
- RLS: users can only read/insert/delete their own rows; anyone can read follow counts

#### `recipe_saves`
- `id`, `recipe_id` (FK → recipes), `user_id` (FK → profiles), `saved_at`
- Unique constraint on `(recipe_id, user_id)`
- RLS: users can only read/insert/delete their own rows

#### `feed_events`
- `id`, `event_type` (`recipe_created` | `recipe_updated` | `recipe_added_to_family` | `recipe_added_to_cookbook`), `recipe_id` (FK → recipes), `actor_id` (FK → profiles), `family_id` (nullable FK → families), `cookbook_id` (nullable FK → cookbooks), `created_at`
- Populated by Postgres triggers on `recipes`, `family_recipes`, and `cookbook_recipes`
- RLS: readable by any authenticated user (recipe-level visibility is enforced in the feed query)
- Index on `created_at DESC` for fast pagination

#### `family_followers` (already planned in Phase 4)
- `id`, `family_id`, `user_id`, `followed_at`
- Implement here if not done in Phase 4/5

---

### Feed algorithm

The feed is computed by a Postgres function `get_feed(p_user_id uuid, p_cursor timestamptz, p_limit int)` that returns a ranked list of `feed_events`.

#### Relationship weight (W)

| Relationship to recipe source | Weight |
|-------------------------------|--------|
| You are a member of the family the recipe was added to | 4 |
| You follow the family the recipe was added to | 3 |
| You follow the cookbook the recipe was added to | 2 |
| You saved the recipe (re-surfaced on update) | 1 |
| Public / community (no direct relationship) | 0 |

#### Recency decay (D)

```
D = 1 / (1 + hours_since_event / 48)
```

- Fresh events (< 12 h) retain most of their score.
- Events older than ~4 days score near 0 on recency alone but are saved by a high W.

#### Final score

```
score = W + D
```

Events are sorted `score DESC, created_at DESC` (created_at as tiebreaker). Cursor-based pagination slices on `(score, created_at)`.

#### Discover tab

A separate query, independent of the user's relationships:
- Only `recipe_created` events for public recipes
- Sorted purely by `created_at DESC`
- No scoring — simple chronological discovery

---

### Feed UI

#### Feed page — `/feed`

- Full-width card list, replacing or supplementing the current dashboard home
- Source filter tabs at the top:
  - **All** — full ranked feed
  - **My Families** — only events from families the user is a member of
  - **Following** — events from followed families and cookbooks
  - **Discover** — public recipes, chronological
- Each card shows:
  - Recipe title, description excerpt, cover image (if available)
  - Source context ("Added to _Smith Family_ by _Grandma Rose_" or "Added to _Summer Grilling_ cookbook")
  - Relative timestamp ("3 hours ago")
  - Save/bookmark button (toggles `recipe_saves`)
  - Tags
- Infinite scroll via `IntersectionObserver`; loads next cursor on reaching the bottom sentinel
- Empty state per tab with contextual CTAs (e.g., "Follow a family to see their recipes here")

#### Follow/save UX

- **Follow family**: Already planned — follow button on public family detail page
- **Follow cookbook**: Follow button on public cookbook detail page and cookbook cards; shows follower count
- **Save recipe**: Bookmark icon on recipe cards everywhere in the app (feed, cookbook detail, family detail, recipe detail); toggled state persists instantly (optimistic update)

#### Saved recipes page — `/bookmarks`

- Grid of bookmarked recipes, most recently saved first
- Search/filter by tag
- Remove bookmark from this page

---

### Dashboard integration

- Replace the current recipe list on `/dashboard` with a prominent "Go to your Feed" card/CTA
- Keep "My Recipes", "My Cookbooks", and "My Families" sections on the dashboard as management surfaces (not discovery)
- `/feed` is the post-login redirect (implemented in Stream B)

---

## Open questions

- Should we show "recipe updated" events, or only "recipe created / added" events? (Updates can be noisy.)
- Should saved recipes count toward the feed score, or only appear on the `/bookmarks` page?
- Should cookbook follows require the cookbook to be public, or can a family member follow a private family cookbook?
- Should there be a per-user setting to opt out of the algorithmic ranking and always see chronological?
- Should a user's own activity (recipes they created) appear in their own feed?

---

## Out of scope

- Push notifications or email digests for feed activity
- Likes / reactions on recipes (could be Phase 7)
- Comments on recipes (could be Phase 7)
- Following individual users (outside of family relationships)
- Algorithmic personalization beyond relationship weight + recency (e.g., ML-based recommendations)

---

## Status legend

- ✅ Implemented
- ⬜ Not yet implemented

## Progress

### ⬜ Data model — not yet implemented
- `family_followers` table (if not completed in Phase 4/5)
- `cookbook_follows` table
- `recipe_saves` table
- `feed_events` table + triggers on `recipes`, `family_recipes`, `cookbook_recipes`
- `get_feed()` Postgres function

### ✅ Route infrastructure — implemented (Stream B)
- `/feed` route shell at `app/(public)/feed/page.tsx`
  - Authenticated: filter tabs (All / My Families / Following / Public) + personalized feed placeholder
  - Unauthenticated: public feed placeholder + sign-up CTA
- `/bookmarks` protected route shell at `app/(auth)/bookmarks/page.tsx`
- `/profile/[userId]` public route shell at `app/(public)/profile/[userId]/page.tsx`
- `AppNav` shared nav component with feed filter links
- Post-login redirect → `/feed`
- Proxy allows `/feed` and `/profile` for unauthenticated users

### ⬜ Feed page content — not yet implemented (Stream C)
- Feed card component
- Server action wrapping `get_feed()`
- Infinite scroll with `IntersectionObserver` + cursor pagination
- Empty states per tab

### ⬜ Cookbook follow UX — not yet implemented
- Follow/unfollow button on cookbook detail and cards
- Follower count display

### ⬜ Recipe save (bookmark) UX — not yet implemented
- Save/unsave button on recipe cards and detail pages
- `/bookmarks` page content (shell exists)

### ⬜ Dashboard integration — not yet implemented
- Feed CTA on dashboard home
