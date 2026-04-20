# Phase 4 — Families

## Goal

Users can create families, invite other users to join, and add cookbooks to a family. Family members can view all recipes and cookbooks belonging to the family.

## Scope

### Family data model
- Name
- Visibility: public or private
- Members (collection of users)
- Cookbooks assigned to the family
- Created/updated timestamps

### Family management (authenticated users)
- Create a new family
- Invite another user to a family they belong to
- Accept a family invitation

### Adding cookbooks to a family
- A user can add a cookbook to a family they belong to
- When a cookbook is added to a family, all recipes in that cookbook become visible to family members

### Family member access
- All members of a family can view all recipes assigned to the family
- All members of a family can view all cookbooks assigned to the family

### Family visibility
- Public families are browsable and searchable by anyone
- Private families are only visible to their members

### Family search
- Unauthenticated users: search across public families
- Authenticated users: search across public families and families they belong to

### Cookbook search update
- Authenticated users can now also find cookbooks that are part of a family they belong to

## Open questions
- Can a user belong to multiple families? (requirements don't restrict this — assume yes)
- Can a user leave a family?
- Who can remove a member from a family?

## Out of scope
- Family-editable cookbooks/recipes (Phase 5)
