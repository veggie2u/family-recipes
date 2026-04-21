import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { updateRecipe } from "../../actions";
import { RecipeForm } from "../../recipe-form";
import Link from "next/link";
import { Suspense } from "react";

async function BackLink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Link
      href={`/dashboard/recipes/${id}`}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      ← Back to recipe
    </Link>
  );
}

async function EditRecipeForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const [{ data: recipe, error }, { data: allTagsData }, { data: recipeTagsData }] =
    await Promise.all([
      supabase.from("recipes").select("*").eq("id", id).eq("created_by", userId).single(),
      supabase.from("tags").select("name").order("name"),
      supabase
        .from("recipe_tags")
        .select("tags(name)")
        .eq("recipe_id", id),
    ]);

  if (error || !recipe) {
    notFound();
  }

  const allTags = allTagsData?.map((t) => t.name) ?? [];
  const defaultTags = recipeTagsData?.flatMap((rt) =>
    Array.isArray(rt.tags) ? rt.tags.map((t: { name: string }) => t.name) : rt.tags ? [(rt.tags as { name: string }).name] : []
  ) ?? [];

  const updateWithId = updateRecipe.bind(null, id);

  return (
    <RecipeForm
      action={updateWithId}
      allTags={allTags}
      defaultValues={{
        title: recipe.title,
        description: recipe.description ?? "",
        ingredients: recipe.ingredients ?? "",
        instructions: recipe.instructions ?? "",
        is_public: recipe.is_public,
        tags: defaultTags,
      }}
      submitLabel="Save Changes"
      cancelHref={`/dashboard/recipes/${id}`}
    />
  );
}

export default function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Suspense>
          <BackLink params={params} />
        </Suspense>
        <h1 className="font-display text-3xl font-bold text-foreground mt-3">
          Edit Recipe
        </h1>
      </div>
      <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-10 bg-muted rounded" /><div className="h-20 bg-muted rounded" /><div className="h-32 bg-muted rounded" /></div>}>
        <EditRecipeForm params={params} />
      </Suspense>
    </div>
  );
}
