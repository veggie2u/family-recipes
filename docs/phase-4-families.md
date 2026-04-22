# Phase 4 — Families

## Goal

Users can create families, invite other users to join, and add cookbooks to a family. Family members can view and edit all recipes and cookbooks belonging to the family.

## Status legend

- ✅ Implemented
- ⬜ Not yet implemented

## Scope

### Family data model
- ✅ Name
- ✅ Visibility: public or private
- ✅ Members (collection of users)
- ✅ Cookbooks assigned to the family (schema only — `family_cookbooks` table with `members_can_edit`)
- ✅ Created timestamp; no `updated_at`

### Family management (authenticated users)
- ✅ Create a new family (`/dashboard/families/new`)
- ✅ Invite another user to a family they belong to (by searching existing accounts — debounced name search)
- ✅ Accept a family invitation (on `/dashboard/families` and `/dashboard`)
- ✅ Decline a family invitation (on `/dashboard/families` and `/dashboard`)

### Adding cookbooks to a family
- ✅ A user can add a cookbook to a family they belong to
- ✅ When a cookbook is added to a family, all recipes in that cookbook become visible to family members

### Family member access
- ⬜ All members of a family can view and edit all recipes assigned to the family
- ⬜ All members of a family can view and edit all cookbooks assigned to the family

### Family visibility
- ✅ Public families are browsable by anyone (`/families`)
- ✅ Private families are only visible to their members (enforced by RLS)

### Family search
- ⬜ Unauthenticated users: search across public families
- ⬜ Authenticated users: search across public families and families they belong to

### Cookbook search update
- ⬜ Authenticated users can now also find cookbooks that are part of a family they belong to

## Future features (not yet implemented)

### Family followers
- Any authenticated user can "follow" a public family to stay updated on its recipes and cookbooks
- Followers have read-only access — they cannot edit family content
- Followers are distinct from members: they do not appear in the members list and are not affected by invitations
- Private families cannot be followed; they can only be joined via invitation
- Use case: public influencer families where the creator wants to share recipes with a broad audience

**Planned schema addition:** `family_followers(id, family_id, user_id, followed_at)` with unique constraint on `(family_id, user_id)`.

### Email invite for non-existing users
- When inviting someone by email address who does not yet have a Family Recipes account, send them a Supabase sign-up invite email
- After they create their account, they automatically receive a pending family invitation they can accept on `/dashboard/families`
- Requires a `family_pending_email_invites` table and an update to the `on_auth_user_created` DB trigger
- See GitHub issue for full technical details

## Open questions
- Can a user belong to multiple families? (requirements don't restrict this — assume yes)
- Can a user leave a family?
- Who can remove a member from a family?

---

## Progress

### ✅ Family data model — complete
- `families` table: `name`, `is_public`, `created_by`, `created_at`
- `family_members` table: `family_id`, `user_id`, `role`, `joined_at`, `status` (`'active'` | `'invited'`)
- `family_cookbooks` join table: `family_id`, `cookbook_id`, `members_can_edit`, `added_at`
- `family_recipes` join table: `family_id`, `recipe_id`, `added_at`
- RLS policies applied (see `database-schema.md`)
- `is_family_member(p_family_id uuid)` security-definer helper function prevents RLS recursion on `family_members`
- `lookup_user_id_by_email(p_email text)` security-definer function for email → user ID lookups (used internally)

### ✅ Family management — complete
- **Create** — `/dashboard/families/new`: form with name (required, max 100 chars) and public/private toggle
- **Invite by user search** — search-as-you-type name picker on the family detail page; debounced 300ms, excludes existing members; calls `searchUsers(query, familyId)` → `inviteToFamily(familyId, userId)`
- **Accept invitation** — available on `/dashboard/families` (Pending Invitations section) and on the dashboard home page; sets `status = 'active'`
- **Decline invitation** — same locations; deletes the `family_members` row
- Server actions in `app/dashboard/families/actions.ts`: `createFamily`, `inviteToFamily`, `acceptInvitation`, `declineInvitation`, `searchUsers`

### ✅ Family pages — complete
- `/dashboard/families` — My Families grid (active memberships) + Pending Invitations (invited status) with Accept/Decline; back-to-dashboard link at top
- `/dashboard/families/new` — create family form
- `/dashboard/families/[id]` — family detail: name, visibility badge, member list with role/status badges, invite section (active members only)

### ✅ Dashboard integration — complete
- "My Families" section on the dashboard home shows family cards (name, visibility, member count)
- "Pending Family Invitations" section on the dashboard home (between search and My Recipes) for quick Accept/Decline without navigating away
- `FamilyCard` component (`components/family-card.tsx`) used across listings

### 🔲 Adding cookbooks to a family — not yet implemented
- UI for assigning an existing cookbook to a family
- DB tables (`family_cookbooks`) are in place; server actions not yet created

### 🔲 Family search — not yet implemented
- Searchable listing of public families for unauthenticated and authenticated users

### 🔲 Cookbook search update — not yet implemented
- Finding cookbooks that belong to a family the user is a member of in the broader cookbook browse page (`/dashboard/cookbooks`)
