import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecipeSearchInput } from "@/components/recipe-search-input";
import { RecipeCard } from "@/components/recipe-card";

async function RecipeList({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { q: query } = await searchParams;

  const [{ data: { user } }, recipesResult] = await Promise.all([
    supabase.auth.getUser(),
    (async () => {
      let request = supabase
        .from("recipes")
        .select("id, title, description, created_by, profiles(name), recipe_tags(tags(name))")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (query) {
        request = request.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      return request;
    })(),
  ]);

  const recipes = recipesResult.data;

  if (!recipes?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <BookOpen className="w-10 h-10" />
        <p>{query ? `No recipes found for "${query}"` : "No recipes have been shared yet."}</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => {
        const isOwner = user?.id === recipe.created_by;
        const creatorName = (recipe.profiles as unknown as { name: string | null } | null)?.name ?? undefined;
        const tags: string[] = recipe.recipe_tags?.flatMap(
          (rt: { tags: { name: string } | { name: string }[] | null }) =>
            Array.isArray(rt.tags) ? rt.tags.map((t) => t.name) : rt.tags ? [rt.tags.name] : []
        ) ?? [];
        return (
          <li key={recipe.id}>
            <RecipeCard
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              isOwner={isOwner}
              creatorName={creatorName}
              tags={tags}
              href={`/recipes/${recipe.id}`}
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function PublicRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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

      <Suspense>
        <RecipeSearchInput />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <RecipeList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
