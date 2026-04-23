import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/recipe-card";
import { FollowButton } from "@/components/follow-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { BackButton } from "@/components/back-button";
import { cn } from "@/lib/utils";

type RecipeRow = {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_by: string;
  profiles: { name: string | null } | null;
  recipe_tags: Array<{ tags: { name: string } | { name: string }[] | null }>;
};

async function CookbookDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: cookbook, error }, { data: claimsData }] = await Promise.all([
    supabase
      .from("cookbooks")
      .select(
        "id, name, description, is_public, created_by, profiles(name), cookbook_tags(tags(name))"
      )
      .eq("id", id)
      .eq("is_public", true)
      .single(),
    supabase.auth.getClaims(),
  ]);

  if (error || !cookbook) notFound();

  const userId = claimsData?.claims?.sub ?? null;
  const isOwner = userId === cookbook.created_by;

  const creatorName =
    (cookbook.profiles as unknown as { name: string | null } | null)?.name ??
    undefined;
  const tags: string[] =
    cookbook.cookbook_tags?.flatMap(
      (ct: { tags: { name: string } | { name: string }[] | null }) =>
        Array.isArray(ct.tags)
          ? ct.tags.map((t) => t.name)
          : ct.tags
            ? [ct.tags.name]
            : []
    ) ?? [];

  // Parallel: follower count, user follow row, recipes
  const [
    { count: followerCount },
    { data: userFollowRow },
    { data: cookbookRecipes },
  ] = await Promise.all([
    supabase
      .from("cookbook_follows")
      .select("*", { count: "exact", head: true })
      .eq("cookbook_id", id),
    userId
      ? supabase
          .from("cookbook_follows")
          .select("id")
          .eq("cookbook_id", id)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("cookbook_recipes")
      .select(
        "recipes(id, title, description, is_public, created_by, profiles(name), recipe_tags(tags(name)))"
      )
      .eq("cookbook_id", id)
      .order("added_at", { ascending: false }),
  ]);

  const isFollowing = !!userFollowRow;
  const recipes = (cookbookRecipes ?? [])
    .map((cr) => cr.recipes)
    .flat()
    .filter((r): r is NonNullable<typeof r> => r != null) as unknown as RecipeRow[];

  // Batch-fetch bookmark state for authenticated users
  let bookmarkedIds = new Set<string>();
  if (userId && recipes.length > 0) {
    const recipeIds = recipes.map((r) => r.id);
    const { data: bookmarks } = await supabase
      .from("recipe_bookmarks")
      .select("recipe_id")
      .eq("user_id", userId)
      .in("recipe_id", recipeIds);
    bookmarkedIds = new Set((bookmarks ?? []).map((b) => b.recipe_id));
  }

  return (
    <article className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span
            className={cn(
              "self-start flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              cookbook.is_public
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {cookbook.is_public ? (
              <>
                <Globe className="w-3 h-3" /> Public
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Private
              </>
            )}
          </span>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {cookbook.name}
          </h1>
          {(isOwner || creatorName) && (
            <p
              className={`text-sm ${isOwner ? "text-accent/70" : "text-muted-foreground"}`}
            >
              {isOwner ? "Your cookbook" : creatorName}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Follow button — authenticated non-owners only */}
        {userId && !isOwner && (
          <FollowButton
            type="cookbook"
            targetId={id}
            initialFollowing={isFollowing}
            followerCount={followerCount ?? 0}
            className="shrink-0"
          />
        )}
      </div>

      {cookbook.description && (
        <p className="text-muted-foreground text-lg leading-relaxed">
          {cookbook.description}
        </p>
      )}

      {/* Recipes */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl text-foreground">Recipes</h2>
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No recipes in this cookbook yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => {
              const recipeTags =
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
                    tags={recipeTags}
                    href={`/recipes/${recipe.id}`}
                  />
                  {userId && (
                    <div className="flex justify-end">
                      <BookmarkButton
                        recipeId={recipe.id}
                        initialBookmarked={bookmarkedIds.has(recipe.id)}
                      />
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

export default function PublicCookbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <BackButton label="← Back to cookbooks" />

      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        }
      >
        <CookbookDetailContent params={params} />
      </Suspense>
    </div>
  );
}
