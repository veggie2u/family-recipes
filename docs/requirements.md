# Family Recipes

## Not logged in user

    - Can see initial welcome page
    - Can see the public feed at /feed: a ranked, infinite-scroll listing of public recipes, cookbooks, and families
    - Can search globally across all public recipes, cookbooks, families, users, and tags
    - Can browse and view public recipes (recipes/cookbooks/families pages are filters on the public feed)
    - Can view a single public recipe (title, description, ingredients, instructions, tags, author, public cookbooks/families it belongs to)
    - Can view a single public cookbook (name, description, public recipes within it, families it belongs to, tags, owner)
    - Can view a single public family (details, members, cookbooks, recipes)
    - Can view a public user profile (public recipes, public cookbooks, public families, name, avatar)
    - Can log in or sign up

## User

    - a User has an account
    - a user has a profile with a name and avatar
    - a user can view and update their profile on the profile page (/profile)
    - a user has a personalized feed at /feed showing content from families they belong to, families/cookbooks they follow, and public content
    - a user can follow any public family (read-only access; followers are distinct from members and do not appear in the members list)
    - a user can follow any public cookbook to surface new recipes added to it in their feed
    - a user can bookmark any recipe they can access; bookmarks appear at /bookmarks
    - a user can create a family
    - a user can create a cookbook
    - a user can create a recipe
    - a user can add a cookbook to a family
    - a user can add a recipe directly to a family they belong to
    - a user can invite another user to a family they belong to
    - a user can choose whether a recipe they own is publicly visible
    - a user can share a recipe that is publicly visible
    - a user can search for recipes that are public, they own, or a part of a family they belong to
    - a user can search for public families or families they belong to
    - a user can search for public cookbooks or cookbooks they own, or cookbooks that are part of the family they belong to
    - a user can view another user's profile (see Following section for visibility rules)

## Feed

    - the feed lives at /feed and is accessible to both authenticated and unauthenticated users
    - unauthenticated users see public recipes, cookbooks, and families only
    - authenticated users see ranked, personalized content: family content, followed content, and public content
    - the feed displays an infinite-scroll list of activity cards ranked by relationship weight + recency
    - filters on the feed allow users to narrow content by source (e.g. my families, following, public)
    - relationship weights for ranking (authenticated only):
        - member of the family the recipe was added to → weight 4
        - following the family the recipe was added to → weight 3
        - following the cookbook the recipe was added to → weight 2
        - bookmarked the recipe (re-surfaced on update) → weight 1
        - public / no direct relationship → weight 0
    - recency decay: D = 1 / (1 + hours_since_event / 48); combined score = weight + decay
    - feed uses cursor-based pagination (stable under concurrent inserts); new items load automatically via IntersectionObserver
    - each feed card shows: recipe title, description excerpt, cover image (if available), source context (e.g. "Added to Smith Family by Grandma Rose"), relative timestamp, bookmark button, tags
    - empty state with contextual CTAs

## Following

    - any authenticated user can follow a public family
        - followers have read-only access and do not appear in the family members list
        - private families cannot be followed; they can only be joined by invitation
        - following a family surfaces that family's recipe/cookbook activity in the user's feed
    - any authenticated user can follow a public cookbook
        - following a cookbook surfaces new recipes added to it in the user's feed
        - cookbook detail pages and cards show a follow button and follower count
    - a user can unfollow a family or cookbook at any time

## Bookmarks

    - a user can bookmark any recipe they can access (public recipes, their own recipes, or recipes in a family they belong to)
    - the bookmark icon appears on recipe cards throughout the app (feed, cookbook detail, family detail, recipe detail)
    - toggling a bookmark updates instantly (optimistic UI)
    - bookmarked recipes are accessible at /bookmarks, ordered by most recently bookmarked
    - the bookmarks page supports filtering by tag
    - a user can remove a bookmark from the /bookmarks page

## Family

    - a family is a collection of users
    - a family can be public or private
    - a family's users can view and edit all recipes assigned to the family
    - a family's users can view and edit all cookbooks assigned to the family
    - any authenticated user can follow a public family to receive updates in their feed (read-only access)

## Cookbook

    - a cookbook is a collection of recipes
    - a cookbook added to a family makes the recipes belong to the family
    - when a cookbook is added to a family, the user can choose if the cookbook is editable by family members (add/delete recipe)
    - a cookbook can be shared with multiple families
    - any authenticated user can follow a public cookbook

> ⚠️ **Eligible recipes** (recipes a user can add to a cookbook) are currently defined as recipes the user owns. This definition will need to be revisited once families are implemented (Phase 4), as family membership may expand which recipes are eligible.

## Recipe

    - the recipe is associated to the user that created it
    - a recipe has a title (required), description, ingredients (required), and instructions (required)
    - a recipe can be marked public or private (default private)
    - a recipe can have one or more tags
    - tags are shared across all recipes (a tag entered on one recipe is available to all users when tagging)
    - a user can add a recipe to a family and/or a cookbook
    - when a cookbook is added to a family, the user can choose if the recipes are editable by family members (modify recipe)
    - can have multiple pictures associated with it

> 🔲 **Future feature:** on the recipe detail page, show which cookbooks the recipe currently belongs to.

## UX / Navigation

    - /feed is the primary destination after login and is also publicly accessible
    - the "Recipes", "Cookbooks", and "Families" navigation items are filters on the feed, not standalone listing pages
    - the authenticated home (/dashboard) is the user's "My Profile" page showing:
        - pending family invitations (Accept/Decline)
        - top 6 of: my recipes + recipes in families I belong to (public and private)
        - top 6 of: my cookbooks + cookbooks in families I belong to (public and private)
        - top 6 of: families I belong to
        - search across the above
        - links to full pages to view/search/filter my recipes, my cookbooks, my families
    - viewing another user's profile (authenticated):
        - shows their recipes (public + private if in a shared family), cookbooks, and families
        - each section has a link to a full search/filter page for that user's content
        - shows name and avatar
    - viewing another user's profile (public):
        - shows only their public recipes, public cookbooks, public families
        - each section has a link to a full search/filter page for that user's public content
        - shows name and avatar
    - the "back" link on the recipe detail page must be context-aware — it should return the user to the page they navigated from, not a hardcoded route
        - if the user arrived from a cookbook detail page, back returns them to that cookbook
        - if the user arrived from the dashboard, back returns them to the dashboard
        - if the user arrived from the public recipes browse page, back returns them to that page
    - the "Members" section on the family detail page (/families/[id]) must be collapsible/expandable
        - the section is collapsed by default
        - the section header always shows the member count (e.g. "Members (4)")
        - clicking the section header toggles the collapsed/expanded state
        - individual member rows are only visible when the section is expanded
        - the toggle state is local UI state (not persisted)

## Frontend Standards

    - all forms must use react-hook-form for state management and validation
    - all forms must use shadcn Form components (Form, FormField, FormItem, FormLabel, FormControl, FormMessage) for consistent styling and inline field error display
    - browser native validation (e.g. the `required` HTML attribute) must not be used; validation rules are defined in react-hook-form and errors are displayed via FormMessage
    - after a form is successfully saved, all fields must be reset/cleared to their default values
    - toast notifications use `sonner` (via shadcn); the `<Toaster position="top-right" />` is mounted in the dashboard layout; use `toast.success(...)` / `toast.error(...)` from `sonner` for user feedback after async actions
