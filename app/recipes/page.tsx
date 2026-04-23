import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { BookOpen, PlusIcon } from "lucide-react";
import { RecipeSearchInput } from "@/components/recipe-search-input";
import { RecipeCard } from "@/components/recipe-card";
import { BookmarkButton } from "@/components/bookmark-button";
import Link from "next/link";

async function RecipeContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const isAuthenticated = !!claimsData?.claims;
  const { q: query } = await searchParams;

  // ── Authenticated: show the user's own + family recipes ───────────────────
  if (isAuthenticated) {
    const userId = claimsData.claims.sub;

    const [{ data: ownCookbooks }, { data: memberships }] = await Promise.all([
      supabase.from("cookbooks").select("id").eq("created_by", userId),
      supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", userId)
        .eq("status", "active"),
    ]);

    const ownCookbookIds = ownCookbooks?.map((c) => c.id) ?? [];
    const familyIds = memberships?.map((m) => m.family_id) ?? [];

    let familyCookbookIds: string[] = [];
    if (familyIds.length > 0) {
      const { data: fcRows } = await supabase
        .from("family_cookbooks")
        .select("cookbook_id")
        .in("family_id", familyIds);
      familyCookbookIds = fcRows?.map((r) => r.cookbook_id) ?? [];
    }

    const allCookbookIds = [
      ...new Set([...ownCookbookIds, ...familyCookbookIds]),
    ];

    let cookbookRecipeIds: string[] = [];
    if (allCookbookIds.length > 0) {
      const { data: crRows } = await supabase
        .from("cookbook_recipes")
        .select("recipe_id")
        .in("cookbook_id", allCookbookIds);
      cookbookRecipeIds = crRows?.map((r) => r.recipe_id) ?? [];
    }

    let request = supabase
      .from("recipes")
      .select(
        "id, title, description, is_public, created_by, profiles(name), recipe_tags(tags(name))"
      )
      .order("created_at", { ascending: false });

    if (cookbookRecipeIds.length > 0) {
      request = request.or(
        `created_by.eq.${userId},id.in.(${cookbookRecipeIds.join(",")})`
      );
    } else {
      request = request.eq("created_by", userId);
    }

    if (query) {
      request = request.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    const { data: recipes, error } = await request;
    if (error) throw new Error(error.message);

    // Batch-fetch bookmark state
    let bookmarkedIds = new Set<string>();
    if (recipes?.length) {
      const recipeIds = recipes.map((r) => r.id);
      const { data: bookmarks } = await supabase
        .from("recipe_bookmarks")
        .select("recipe_id")
        .eq("user_id", userId)
        .in("recipe_id", recipeIds);
      bookmarkedIds = new Set((bookmarks ?? []).map((b) => b.recipe_id));
    }

    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Recipes
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse your families&apos; recipes.
            </p>
          </div>
          <Link
            href="/recipes/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-4 h-4" />
            Add Recipe
          </Link>
        </div>

        {!recipes?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
            {query ? (
              <p className="text-muted-foreground text-lg">
                No recipes found for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <p className="text-muted-foreground text-lg">No recipes yet.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => {
              const tags =
                recipe.recipe_tags?.flatMap(
                  (rt: {
                    tags: { name: string } | { name: string }[] | null;
                  }) =>
                    Array.isArray(rt.tags)
                      ? rt.tags.map((t) => t.name)
                      : rt.tags
                        ? [rt.tags.name]
                        : []
                ) ?? [];
              return (
                <div key={recipe.id} className="flex flex-col gap-1">
                  <RecipeCard
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    isPublic={recipe.is_public}
                    isOwner={recipe.created_by === userId}
                    creatorName={
                      (
                        recipe.profiles as unknown as {
                          name: string | null;
                        } | null
                      )?.name ?? undefined
                    }
                    tags={tags}
                  />
                  <div className="flex justify-end">
                    <BookmarkButton
                      recipeId={recipe.id}
                      initialBookmarked={bookmarkedIds.has(recipe.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  // ── Unauthenticated: public listing ───────────────────────────────────────
  let request = supabase
    .from("recipes")
    .select(
      "id, title, description, created_by, profiles(name), recipe_tags(tags(name))"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (query) {
    request = request.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  const { data: recipes } = await request;

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Recipes
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse recipes shared by the community.
        </p>
      </div>

      {!recipes?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <BookOpen className="w-10 h-10" />
          <p>
            {query
              ? `No recipes found for "${query}"`
              : "No recipes have been shared yet."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => {
            const tags: string[] =
              recipe.recipe_tags?.flatMap(
                (rt: {
                  tags: { name: string } | { name: string }[] | null;
                }) =>
                  Array.isArray(rt.tags)
                    ? rt.tags.map((t) => t.name)
                    : rt.tags
                      ? [rt.tags.name]
                      : []
              ) ?? [];
            return (
              <li key={recipe.id}>
                <RecipeCard
                  id={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  creatorName={
                    (
                      recipe.profiles as unknown as {
                        name: string | null;
                      } | null
                    )?.name ?? undefined
                  }
                  tags={tags}
                  href={`/recipes/${recipe.id}`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function RecipeContentSkeleton() {
  return (
    <>
      <div className="h-14 animate-pulse rounded-lg bg-muted/30" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense>
        <RecipeSearchInput />
      </Suspense>

      <Suspense fallback={<RecipeContentSkeleton />}>
        <RecipeContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
