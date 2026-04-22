import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Globe, Lock } from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/recipe-card";
import { DeleteCookbookButton } from "@/components/delete-cookbook-button";
import AddRecipeToCookbookPanel from "@/components/add-recipe-to-cookbook-panel";
import { RemoveRecipeFromCookbookButton } from "@/components/remove-recipe-from-cookbook-button";

async function CookbookDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: cookbook, error } = await supabase
    .from("cookbooks")
    .select("*, profiles(name), cookbook_tags(tags(name))")
    .eq("id", id)
    .single();

  if (error || !cookbook) {
    notFound();
  }

  const isOwner = cookbook.created_by === userId;
  const creatorName = (cookbook.profiles as unknown as { name: string | null } | null)?.name ?? undefined;
  const tags: string[] = cookbook.cookbook_tags?.flatMap(
    (ct: { tags: { name: string } | { name: string }[] | null }) =>
      Array.isArray(ct.tags) ? ct.tags.map((t) => t.name) : ct.tags ? [ct.tags.name] : []
  ) ?? [];

  const { data: cookbookRecipes } = await supabase
    .from("cookbook_recipes")
    .select("recipes(id, title, description, is_public, created_by, profiles(name), recipe_tags(tags(name)))")
    .eq("cookbook_id", id)
    .order("added_at", { ascending: false });

  type RecipeRow = {
    id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    created_by: string;
    profiles: { name: string | null } | null;
    recipe_tags: Array<{ tags: { name: string } | { name: string }[] | null }>;
  };

  const recipes = (cookbookRecipes ?? [])
    .map((cr) => cr.recipes)
    .flat()
    .filter((r): r is NonNullable<typeof r> => r != null) as unknown as RecipeRow[];

  const recipeIdsInCookbook = recipes.map((r) => r.id);

  let allUserRecipes: { id: string; title: string; description: string | null }[] = [];
  if (isOwner) {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, description")
      .eq("created_by", userId)
      .order("title");
    allUserRecipes = data ?? [];
  }

  return (
    <article className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span
            className={`self-start flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              cookbook.is_public
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {cookbook.is_public ? (
              <><Globe className="w-3 h-3" /> Public</>
            ) : (
              <><Lock className="w-3 h-3" /> Private</>
            )}
          </span>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {cookbook.name}
          </h1>
          {(isOwner || creatorName) && (
            <p className={`text-sm ${isOwner ? "text-accent/70" : "text-muted-foreground"}`}>
              {isOwner ? "Your cookbook" : creatorName}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
        {isOwner && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard/cookbooks/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
            <DeleteCookbookButton id={id} />
          </div>
        )}
      </div>

      {cookbook.description && (
        <p className="text-muted-foreground text-lg leading-relaxed">
          {cookbook.description}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-xl text-foreground">Recipes</h2>
          {isOwner && (
            <AddRecipeToCookbookPanel
              cookbookId={id}
              allRecipes={allUserRecipes}
              initialSelectedIds={recipeIdsInCookbook}
            />
          )}
        </div>
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No recipes in this cookbook yet.{isOwner ? " Use the button above to add your first recipe." : ""}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => {
              const recipeTags = recipe.recipe_tags?.flatMap(
                (rt: { tags: { name: string } | { name: string }[] | null }) =>
                  Array.isArray(rt.tags) ? rt.tags.map((t) => t.name) : rt.tags ? [rt.tags.name] : []
              ) ?? [];
              return (
                <div key={recipe.id} className="flex flex-col gap-1">
                  <RecipeCard
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    isPublic={recipe.is_public}
                    isOwner={recipe.created_by === userId}
                    creatorName={(recipe.profiles as unknown as { name: string | null } | null)?.name ?? undefined}
                    tags={recipeTags}
                  />
                  {isOwner && (
                    <div className="flex justify-end">
                      <RemoveRecipeFromCookbookButton cookbookId={id} recipeId={recipe.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}

export default function CookbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/cookbooks"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to cookbooks
        </Link>
      </div>
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-2/3" /><div className="h-4 bg-muted rounded w-full" /><div className="h-32 bg-muted rounded" /></div>}>
        <CookbookDetailContent params={params} />
      </Suspense>
    </div>
  );
}
