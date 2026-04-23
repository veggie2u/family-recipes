import { createRecipe } from "../actions";
import { RecipeForm } from "../recipe-form";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";

async function NewRecipeForm() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("name")
    .order("name");

  const allTags = tags?.map((t) => t.name) ?? [];

  return <RecipeForm action={createRecipe} cancelHref="/recipes" allTags={allTags} />;
}

export default function NewRecipePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <BackButton label="← Back to recipes" />
        <h1 className="font-display text-3xl font-bold text-foreground mt-3">
          New Recipe
        </h1>
      </div>

      <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-10 bg-muted rounded" /><div className="h-20 bg-muted rounded" /><div className="h-32 bg-muted rounded" /></div>}>
        <NewRecipeForm />
      </Suspense>
    </div>
  );
}
