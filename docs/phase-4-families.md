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
