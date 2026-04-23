import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail";
import { BackButton } from "@/components/back-button";

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

  return (
    <RecipeDetail
      title={recipe.title}
      description={recipe.description}
      ingredients={recipe.ingredients}
      instructions={recipe.instructions}
      isOwner={isOwner}
      creatorName={creatorName}
      tags={tags}
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
