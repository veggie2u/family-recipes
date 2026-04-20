# Phase 5 — Permissions & Sharing

## Goal

Refine access controls so cookbook and recipe owners can grant family members edit rights. Add public recipe sharing. Complete cross-scope search.

## Scope

### Cookbook editability by family members
- When adding a cookbook to a family, the owner can choose whether family members can add or remove recipes from that cookbook
- This setting can be changed after the fact by the cookbook owner

### Recipe editability by family members
- When a cookbook is added to a family, the owner can choose whether family members can modify the recipes in that cookbook
- This setting is per cookbook-family association

### Recipe sharing
- A user can generate a shareable link for any public recipe they own
- Anyone with the link can view the recipe (no account required)

### Full cross-scope search (authenticated users)
- **Recipes**: public + owned + part of a family they belong to
- **Cookbooks**: public + owned + part of a family they belong to
- **Families**: public + families they belong to

## Open questions
- Are edit permissions (add/remove recipes, modify recipes) separate toggles or a single toggle per cookbook-family association?
- Does revoking edit access retroactively affect changes already made?
- Is there a role system within families (e.g., admin vs member) or is the cookbook owner always the authority?
