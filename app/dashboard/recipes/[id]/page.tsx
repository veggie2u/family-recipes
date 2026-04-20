import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Lock, Pencil } from "lucide-react";
import { Suspense } from "react";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";

async function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  const isOwner = recipe.created_by === userId;

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                recipe.is_public
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {recipe.is_public ? (
                <><Globe className="w-3 h-3" /> Public</>
              ) : (
                <><Lock className="w-3 h-3" /> Private</>
              )}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {recipe.title}
          </h1>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard/recipes/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
            <DeleteRecipeButton id={id} />
          </div>
        )}
      </div>

      {recipe.description && (
        <p className="text-muted-foreground mb-8 text-base leading-relaxed">
          {recipe.description}
        </p>
      )}

      {recipe.ingredients && (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-xl text-foreground mb-3">
            Ingredients
          </h2>
          <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed border border-border rounded-md p-4 bg-muted/30">
            {recipe.ingredients}
          </pre>
        </section>
      )}

      {recipe.instructions && (
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-3">
            Instructions
          </h2>
          <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed border border-border rounded-md p-4 bg-muted/30">
            {recipe.instructions}
          </pre>
        </section>
      )}
    </>
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
        <RecipeDetail params={params} />
      </Suspense>
    </div>
  );
}
