import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

async function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id, title, description, ingredients, instructions, created_at, recipe_tags(tags(name))")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (error || !recipe) {
    notFound();
  }

  const tags: string[] = recipe.recipe_tags?.flatMap(
    (rt: { tags: { name: string } | { name: string }[] | null }) =>
      Array.isArray(rt.tags) ? rt.tags.map((t) => t.name) : rt.tags ? [rt.tags.name] : []
  ) ?? [];

  return (
    <article className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          {recipe.title}
        </h1>
        {recipe.description && (
          <p className="text-muted-foreground mt-2 text-lg">
            {recipe.description}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {recipe.ingredients && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-xl text-foreground">Ingredients</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-muted rounded-lg p-4 leading-relaxed">
            {recipe.ingredients}
          </pre>
        </section>
      )}

      {recipe.instructions && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-xl text-foreground">Instructions</h2>
          <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed bg-muted rounded-lg p-4">
            {recipe.instructions}
          </div>
        </section>
      )}
    </article>
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
        <RecipeDetail params={params} />
      </Suspense>
    </div>
  );
}
