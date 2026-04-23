> notes:
> `->` means this page becomes something else (a new feature or page)
> ex: `dashboard -> feed` means the dashboard becomes the feed page
> ex: `recipes -> filters on the feed` means the recipes page becomes a recipes filter on the feed page


# Permissions

## Public Persona
- No editing is ever allowed for the public persona

### dashboard -> feed
- Search global public recipes, cookbooks, families, users, tags
- Ranked/sorted infinite scroll including *public* recipes
- Ranked/sorted infinite scroll including *public* cookbooks
- Ranked/sorted infinite scroll including *public* families

### recipes -> filters on the feed
- All public recipes

### single recipe
- The recipe
- Tags associated with the recipe
- The recipe author
- Any public cookbooks it belongs to
- Any public families it belongs to

### cookbooks -> filters on the feed
- All public cookbooks

### single cookbook
- The cookbook information (title etc)
- The public recipes within the cookbook
- Any families the cookbook belongs to
- Tags associated with the cookbook
- The cookbook owner

### families -> filters on the feed
- All public families

### single family
- Family details
- Family members
- Family cookbooks
- Family recipes

### A public users profile
- All public recipes the user owns
  - Has a link to a new page where you can search/filter the user's recipes
- All public cookbooks the user has created
  - Has a link to a new page where you can search/filter the user's cookbooks
- All public families the user belongs to
  - Has a link to a new page where you can search/filter the user's families
- User name
- Profile Pic (partially implemented)
- Search any of the above criteria in this profile


## Authenticated Persona

[//]: # (- Each page in the authenticated persona can view what the public persona can)

### feed
- Search global public recipes, cookbooks, families, users, tags
- Ranked/sorted infinite scroll including:
  - public recipes
    -         ^ of a family I belong to
- Ranked/sorted infinite scroll including:
  - public cookbooks
    -         ^ of a family I belong to
- Ranked/sorted infinite scroll including:
  - public families
  -           ^ of a family I belong to

### dashboard -> my profile
Should also see:
- Family invitations
- Top 6 of:
  - My recipes
    - Both public and private
  - Recipes that are in a family i belong to
    - Both public and private
- Top 6 of:
  - My cookbooks
    - Both public and private
  - Cookbooks that are in a family i belong to
    - Both public and private
- Top 6 of:
  - Families I belong to
- Search any of the above criteria in my profile
- Has link to a new page to view/search/filter:
  - My recipes
  - My cookbooks
  - My families

### recipes -> a filter on the feed

### single recipe
- The recipe
- Tags associated with the recipe
- The recipe author
- Any public cookbooks it belongs to
- Any private cookbooks that are in a family i belong to
- Any public families it belongs to
- Any private families that this recipe belongs to

### cookbooks -> a filter on the feed

### single cookbook
- The cookbook information (title etc)
- Recipes:
  - Public
  - Private if I also belong to a family that has this cookbook
- Any families the cookbook belongs to
  - Public
  - Private that I also belong to
- Tags associated with the cookbook
- The cookbook owner

### families -> a filter on the feed

### single family
- Family details
- Family members
- Family cookbooks
- Family recipes

### Another user's profile
- Recipes
  - Public
  - Private that are in a family I belong to
  - Has a link to a new page where you can search/filter the user's recipes
- Cookbooks
  - Public
  - Private that are in a family I belong to
  - Has a link to a new page where you can search/filter the user's cookbooks
- Families
  - Public
  - Private that are also a family I belong to
  - Has a link to a new page where you can search/filter the user's families
- User name
- Profile Pic (partially implemented)
- Search any of the above criteria in this profile