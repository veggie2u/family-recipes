import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail";
import { BackButton } from "@/components/back-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { RecipeActionsMenu } from "@/components/recipe-actions-menu";
import AddToCookbookButton from "@/components/add-to-cookbook-button";
import { createClient } from "@/lib/supabase/server";
import { getRecipeReactionData } from "@/app/actions/reactions";
import { ReactionButton } from "@/components/reaction-button";

async function RecipeDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [claimsResult, recipeResult] = await Promise.all([
    supabase.auth.getClaims(),
    supabase
      .from("recipes")
      .select("id, title, description, ingredients, instructions, is_public, created_by, profiles(name), recipe_tags(tags(name))")
      .eq("id", id)
      .single(),
  ]);

  const userId = claimsResult.data?.claims?.sub ?? null;
  const recipe = recipeResult.data;

  if (!recipe) {
    notFound();
  }

  // Access check: public recipes are visible to all; private recipes only to
  // the owner or active members of a family that contains the recipe.
  if (!recipe.is_public) {
    if (!userId) notFound();

    if (recipe.created_by !== userId) {
      // Check if user is an active member of any family that has this recipe
      const { data: familyRecipes } = await supabase
        .from("family_recipes")
        .select("family_id")
        .eq("recipe_id", id);

      const familyIds = familyRecipes?.map((fr) => fr.family_id) ?? [];
      let hasAccess = false;

      if (familyIds.length > 0) {
        const { data: membership } = await supabase
          .from("family_members")
          .select("id")
          .eq("user_id", userId!)
          .eq("status", "active")
          .in("family_id", familyIds)
          .limit(1);
        hasAccess = (membership?.length ?? 0) > 0;
      }

      if (!hasAccess) notFound();
    }
  }

  const isOwner = userId === recipe.created_by;
  const creatorName = (recipe.profiles as unknown as { name: string | null } | null)?.name ?? undefined;
  const tags: string[] = recipe.recipe_tags?.flatMap(
    (rt: { tags: { name: string } | { name: string }[] | null }) =>
      Array.isArray(rt.tags) ? rt.tags.map((t) => t.name) : rt.tags ? [rt.tags.name] : []
  ) ?? [];

  let isBookmarked = false;
  let eligibleCookbooks: { id: string; name: string }[] = [];

  // Fetch bookmark count, user state, and reaction data all in parallel
  const reactionDataPromise = getRecipeReactionData(id, userId);
  const [bookmarkCountResult, ...userQueryResults] = await Promise.all([
    supabase
      .from("recipe_bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", id),
    userId
      ? supabase
          .from("recipe_bookmarks")
          .select("recipe_id")
          .eq("recipe_id", id)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    isOwner && userId
      ? supabase.from("cookbook_recipes").select("cookbook_id").eq("recipe_id", id)
      : Promise.resolve({ data: [] }),
  ]);

  const bookmarkCount = bookmarkCountResult.count ?? 0;

  if (userId) {
    const bookmarkResult = userQueryResults[0] as { data: { recipe_id: string } | null };
    const alreadyInResult = userQueryResults[1] as { data: { cookbook_id: string }[] | null };
    isBookmarked = !!bookmarkResult.data;

    if (isOwner) {
      const excludedIds = (alreadyInResult.data ?? []).map((r) => r.cookbook_id);
      const query = supabase
        .from("cookbooks")
        .select("id, name")
        .eq("created_by", userId)
        .order("name");
      if (excludedIds.length > 0) {
        query.not("id", "in", `(${excludedIds.join(",")})`);
      }
      const { data } = await query;
      eligibleCookbooks = data ?? [];
    }
  }

  const reactionData = await reactionDataPromise;

  return (
    <RecipeDetail
      title={recipe.title}
      description={recipe.description}
      ingredients={recipe.ingredients}
      instructions={recipe.instructions}
      isPublic={recipe.is_public}
      isOwner={isOwner}
      creatorName={creatorName}
      tags={tags}
      actions={
        <>
          {isOwner && (
            <AddToCookbookButton recipeId={id} cookbooks={eligibleCookbooks} />
          )}
          {userId && (
            <BookmarkButton
              recipeId={id}
              initialBookmarked={isBookmarked}
              initialBookmarkCount={bookmarkCount}
              className="border border-border hover:bg-muted hover:text-foreground"
            />
          )}
          {isOwner && <RecipeActionsMenu recipeId={id} />}
        </>
      }
      reactions={
        userId ? (
          <>
            <ReactionButton
              entityType="recipe"
              entityId={id}
              reactionType="chefs_kiss"
              initialActive={reactionData.user_chefs_kiss}
              initialCount={reactionData.chefs_kiss_count}
              userId={userId}
              className="border border-border hover:bg-muted p-1.5 rounded"
            />
            <ReactionButton
              entityType="recipe"
              entityId={id}
              reactionType="made_it"
              initialActive={reactionData.user_made_it}
              initialCount={reactionData.made_it_count}
              userId={userId}
              className="border border-border hover:bg-muted p-1.5 rounded"
            />
          </>
        ) : null
      }
    />
  );
}

export default function PublicRecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-3xl flex flex-col gap-8">
      <BackButton label="← Back to recipes" />

      <Suspense
        fallback={
          <div className="flex flex-col gap-6">
            <div className="h-10 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-48 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        }
      >
        <RecipeDetailContent params={params} />
      </Suspense>
    </div>
  );
}
