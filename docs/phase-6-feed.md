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

### Recipe bookmarks
Users can bookmark any recipe they can see. Bookmarked recipes live at `/bookmarks` and optionally surface in feed ranking (a recipe you bookmarked will re-surface when it gets new activity).

### Feed activity events
Rather than polling raw tables, a `feed_events` table records discrete activity. This keeps feed queries fast and makes the ranking algorithm straightforward.

---

## Scope

### Data model additions

#### `cookbook_follows`
- `id`, `cookbook_id` (FK → cookbooks), `user_id` (FK → profiles), `followed_at`
- Unique constraint on `(cookbook_id, user_id)`
- RLS: users can only read/insert/delete their own rows; anyone can read follow counts

#### `recipe_bookmarks` *(implemented; originally spec'd as `recipe_saves`)*
- `id`, `recipe_id` (FK → recipes), `user_id` (FK → profiles), `bookmarked_at`
- Unique constraint on `(recipe_id, user_id)`
- RLS: users can only read/insert/delete their own rows

#### `feed_events` *(implemented)*
- `id`, `event_type` (`recipe_created` | `recipe_added_to_family` | `recipe_added_to_cookbook`), `recipe_id` (FK → recipes), `actor_id` (FK → profiles), `family_id` (nullable FK → families), `cookbook_id` (nullable FK → cookbooks), `created_at`
- Populated by `SECURITY DEFINER` Postgres triggers on `recipes`, `family_recipes`, and `cookbook_recipes`
- RLS: readable by any authenticated user (recipe-level visibility is enforced in `get_feed()`)
- Indexes on `created_at DESC`, `recipe_id`, `actor_id`, `family_id`, `cookbook_id`

#### `family_followers` *(implemented)*
- `id`, `family_id`, `user_id`, `followed_at`
- Implemented as part of this phase (Stream A)

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
- Source filter controls at the top:
  - **All** — full ranked feed
  - **My Families** — only events from families the user is a member of
  - **Following** — events from followed families and cookbooks
  - **Public** — public recipes, chronological
- Each card shows:
  - Recipe title, description excerpt, cover image (if available)
  - Source context ("Added to _Smith Family_ by _Grandma Rose_" or "Added to _Summer Grilling_ cookbook")
  - Relative timestamp ("3 hours ago")
  - Bookmark button (toggles `recipe_bookmarks`)
  - Tags
- Infinite scroll via `IntersectionObserver`; loads next cursor on reaching the bottom sentinel
- Empty state per filter with contextual CTAs (e.g., "Follow a family to see their recipes here")

#### Follow/save UX

- **Follow family**: Already planned — follow button on public family detail page
- **Follow cookbook**: Follow button on public cookbook detail page and cookbook cards; shows follower count
- **Save recipe**: Bookmark icon on recipe cards everywhere in the app (feed, cookbook detail, family detail, recipe detail); toggled state persists instantly (optimistic update)

#### Bookmarks page — `/bookmarks`

- Grid of bookmarked recipes, most recently saved first
- Search/filter by tag
- Remove bookmark from this page

---

### Dashboard integration

- Replace the current recipe list on `/dashboard` with a prominent "Go to your Feed" card/CTA
- Keep "My Recipes", "My Cookbooks", and "My Families" sections on the dashboard as management surfaces (not discovery)
- Surface the feed as the primary destination after login (post-login redirect → `/feed` once Phase 6 ships)

---

## Open questions

- Should the feed tab be the new default page after login, or remain secondary to the dashboard?
- Should we show "recipe updated" events, or only "recipe created / added" events? (Updates can be noisy.)
- Should bookmarked recipes count toward the feed score, or only appear on the `/bookmarks` page?
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

### ✅ Data model — complete
- `family_followers` table + RLS + indexes
- `cookbook_follows` table + RLS + indexes
- `recipe_bookmarks` table + RLS + index on `(user_id, bookmarked_at DESC)`
- `feed_events` table + indexes + RLS + triggers on `recipes`, `family_recipes`, `cookbook_recipes`
- `get_feed(p_user_id, p_cursor, p_limit, p_filter)` Postgres function (SECURITY DEFINER, `SET search_path = ''`)

### ⬜ Feed page — not yet implemented
- `/feed` route with source filters (All / My Families / Following / Public)
- Feed card component
- Infinite scroll with `IntersectionObserver` + cursor pagination
- Empty states per filter

### ⬜ Cookbook follow UX — not yet implemented
- Follow/unfollow button on cookbook detail and cards
- Follower count display

### ⬜ Recipe bookmark UX — not yet implemented
- Bookmark button on recipe cards and detail pages
- `/bookmarks` page

### ⬜ Dashboard integration — not yet implemented
- Feed CTA on dashboard home
- Post-login redirect update (pending open question resolution)
