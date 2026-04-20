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
- What determines if a cookbook is public vs private? (not explicitly defined in requirements — consider defaulting to private, matching recipe behavior)

## Out of scope
- Adding cookbooks to families (Phase 4)
- Family-editable cookbooks (Phase 5)
