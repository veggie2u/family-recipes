import { createRecipe } from "../actions";
import { RecipeForm } from "../recipe-form";
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

      <RecipeForm action={createRecipe} cancelHref="/dashboard" />
    </div>
  );
}
