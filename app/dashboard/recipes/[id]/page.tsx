import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Suspense } from "react";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { RecipeDetail } from "@/components/recipe-detail";
import AddToCookbookButton from "@/components/add-to-cookbook-button";

async function RecipeDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const [recipeResult, alreadyInResult] = await Promise.all([
    supabase
      .from("recipes")
      .select("*, profiles(name), recipe_tags(tags(name))")
      .eq("id", id)
      .single(),
    supabase
      .from("cookbook_recipes")
      .select("cookbook_id")
      .eq("recipe_id", id),
  ]);

  const { data: recipe, error } = recipeResult;

  if (error || !recipe) {
    notFound();
  }

  const isOwner = recipe.created_by === userId;

  let eligibleCookbooks: { id: string; name: string }[] = [];
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
      isPublic={recipe.is_public}
      isOwner={isOwner}
      creatorName={creatorName}
      tags={tags}
      actions={
        isOwner ? (
          <>
            <AddToCookbookButton recipeId={id} cookbooks={eligibleCookbooks} />
            <Link
              href={`/dashboard/recipes/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
            <DeleteRecipeButton id={id} />
          </>
        ) : undefined
      }
    />
  );
}

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to my recipes
        </Link>
      </div>
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-2/3" /><div className="h-4 bg-muted rounded w-full" /><div className="h-32 bg-muted rounded" /></div>}>
        <RecipeDetailContent params={params} />
      </Suspense>
    </div>
  );
}
