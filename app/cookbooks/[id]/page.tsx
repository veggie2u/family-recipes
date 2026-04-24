import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Globe, Lock, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/recipe-card";
import { FollowButton } from "@/components/follow-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { BackButton } from "@/components/back-button";
import { DeleteCookbookButton } from "@/components/delete-cookbook-button";
import AddRecipeToCookbookPanel from "@/components/add-recipe-to-cookbook-panel";
import { RemoveRecipeFromCookbookButton } from "@/components/remove-recipe-from-cookbook-button";
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

// ─── Data-fetching component ──────────────────────────────────────────────────

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
      .single(),
    supabase.auth.getClaims(),
  ]);

  if (error || !cookbook) notFound();

  const userId = claimsData?.claims?.sub ?? null;
  const isOwner = userId === cookbook.created_by;

  // Private cookbooks are only visible to the creator
  if (!cookbook.is_public && !isOwner) notFound();

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

  // Parallel: follower count, user follow row, recipes (with tags + creator)
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
  const allRecipes = (cookbookRecipes ?? [])
    .map((cr) => cr.recipes)
    .flat()
    .filter((r): r is NonNullable<typeof r> => r != null) as unknown as RecipeRow[];

  // Owners see all recipes; non-owners only see public ones
  const recipes = isOwner ? allRecipes : allRecipes.filter((r) => r.is_public);
  const recipeIdsInCookbook = allRecipes.map((r) => r.id);

  // Fetch user's own recipes for the add-to-cookbook panel (owner only)
  let allUserRecipes: { id: string; title: string; description: string | null }[] = [];
  if (isOwner && userId) {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, description")
      .eq("created_by", userId)
      .order("title");
    allUserRecipes = data ?? [];
  }

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
                ? "border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/40"
                : "border border-border text-muted-foreground"
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
              {isOwner ? "Your cookbook" : `By ${creatorName}`}
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

        {/* Owner actions */}
        {isOwner && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/cookbooks/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
            <DeleteCookbookButton id={id} />
          </div>
        )}

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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-xl text-foreground">Recipes</h2>
            <span className="text-sm text-muted-foreground">({recipes.length})</span>
          </div>
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
            <p className="text-muted-foreground">
              {isOwner
                ? "No recipes in this cookbook yet. Use the button above to add your first recipe."
                : "No public recipes in this cookbook yet."}
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
                <RecipeCard
                  key={recipe.id}
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
                  href={`/recipes/${recipe.id}?from=cookbook`}
                  removeSlot={
                    isOwner ? (
                      <RemoveRecipeFromCookbookButton cookbookId={id} recipeId={recipe.id} />
                    ) : undefined
                  }
                  bookmarkSlot={
                    userId ? (
                      <BookmarkButton
                        recipeId={recipe.id}
                        initialBookmarked={bookmarkedIds.has(recipe.id)}
                      />
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CookbookDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-5 w-16 rounded-full bg-muted" />
      <div className="h-9 w-2/3 rounded bg-muted" />
      <div className="h-4 w-1/4 rounded bg-muted" />
      <div className="h-16 rounded bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicCookbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <BackButton label="← Back to cookbooks" />
      <Suspense fallback={<CookbookDetailSkeleton />}>
        <CookbookDetailContent params={params} />
      </Suspense>
    </div>
  );
}
