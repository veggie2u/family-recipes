# Phase 2 — Recipes

## Goal

Users can create, view, edit, and delete their own recipes. Recipes can be marked public or private. Unauthenticated users can browse and search public recipes.

## Scope

### Recipe data model
- Title, description, ingredients, instructions
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
