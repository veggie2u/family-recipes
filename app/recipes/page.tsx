import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";

async function RecipeList() {
  const supabase = await createClient();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, description, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (!recipes?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <BookOpen className="w-10 h-10" />
        <p>No recipes have been shared yet.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 hover:bg-muted transition-colors h-full"
          >
            <h2 className="font-semibold text-foreground text-lg leading-snug">
              {recipe.title}
            </h2>
            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {recipe.description}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function PublicRecipesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Recipes
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse recipes shared by the community.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <RecipeList />
      </Suspense>
    </div>
  );
}
