import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Suspense } from "react";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { RecipeDetail } from "@/components/recipe-detail";

async function RecipeDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*, profiles(name)")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  const isOwner = recipe.created_by === userId;
  const creatorName = (recipe.profiles as unknown as { name: string | null } | null)?.name ?? undefined;

  return (
    <RecipeDetail
      title={recipe.title}
      description={recipe.description}
      ingredients={recipe.ingredients}
      instructions={recipe.instructions}
      isPublic={recipe.is_public}
      isOwner={isOwner}
      creatorName={creatorName}
      actions={
        isOwner ? (
          <>
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
          ← Back to recipes
        </Link>
      </div>
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-2/3" /><div className="h-4 bg-muted rounded w-full" /><div className="h-32 bg-muted rounded" /></div>}>
        <RecipeDetailContent params={params} />
      </Suspense>
    </div>
  );
}
