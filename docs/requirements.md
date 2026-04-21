# Family Recipes

## Not logged in user

    - Can see initial welcome page
    - can see any publicly visible recipes
    - can search for recipes that are publicly visible
    - can log in or sign up
    - can search for public families
    - can search for public cookbooks

## User

    - a User has an account
    - a user has a profile with a name and avatar
    - a user can view and update their profile on the profile page (/dashboard/profile)
    - a user can create a family
    - a user can create a cookbook
    - a user can create a recipe
    - a user can add a cookbook to a family
    - a user can invite another user to a family they belong to
    - a user can choose whether a recipe they own is publicly visible
    - a user can share a recipe that is publicly visible
    - a user can search for recipes that are public, they own, or a part of a family they belong to
    - a user can search for public families or families they belong to
    - a user can search for public cookbooks or cookbooks they own, or cookbooks that are part of the family they belong to

## Family

    - a family is a collection of users
    - a family can be public or private
    - a family's users can view all recipes assigned to the family
    - a family's users can view all cookbooks assigned to the family

## Cookbook

    - a cookbook is a collection of recipes
    - a cookbook added to a family makes the recipes belong to the family
    - when a cookbook is added to a family, the user can choose if the cookbook is editable by family members (add/delete recipe)
    - a cookbook can be shared with multiple families

## Recipe

    - the recipe is associated to the user that created it
    - a recipe has a title (required), description, ingredients (required), and instructions (required)
    - a recipe can be marked public or private (default private)
    - a recipe can have one or more tags
    - tags are shared across all recipes (a tag entered on one recipe is available to all users when tagging)
    - a user can add a recipe to a family and/or a cookbook
    - when a cookbook is added to a family, the user can choose if the recipes are editable by family members (modify recipe)
    - can have multiple pictures associated with it

## Frontend Standards

    - all forms must use react-hook-form for state management and validation
    - all forms must use shadcn Form components (Form, FormField, FormItem, FormLabel, FormControl, FormMessage) for consistent styling and inline field error display
    - browser native validation (e.g. the `required` HTML attribute) must not be used; validation rules are defined in react-hook-form and errors are displayed via FormMessage