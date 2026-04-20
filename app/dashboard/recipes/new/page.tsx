import { createRecipe } from "../actions";
import Link from "next/link";

export default function NewRecipePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to recipes
        </Link>
        <h1 className="font-display text-3xl font-bold text-foreground mt-3">
          New Recipe
        </h1>
      </div>

      <form action={createRecipe} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. Grandma's Apple Pie"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="A short description of the recipe..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ingredients" className="text-sm font-medium text-foreground">
            Ingredients
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={6}
            placeholder={"2 cups flour\n1 cup sugar\n..."}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="instructions" className="text-sm font-medium text-foreground">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={8}
            placeholder={"Step 1: Preheat oven to 350°F\nStep 2: ..."}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="is_public" className="text-sm font-medium text-foreground">
            Make this recipe public
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Save Recipe
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
