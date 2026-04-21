import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail";

async function RecipeDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: recipe, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("recipes")
      .select("id, title, description, ingredients, instructions, created_by, profiles(name), recipe_tags(tags(name))")
      .eq("id", id)
      .eq("is_public", true)
      .single(),
  ]);

  if (error || !recipe) {
    notFound();
  }

  const isOwner = user?.id === recipe.created_by;
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
      <Link
        href="/recipes"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to recipes
      </Link>

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
