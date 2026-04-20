import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { updateRecipe } from "../../actions";
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

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("created_by", userId)
    .single();

  if (error || !recipe) {
    notFound();
  }

  const updateWithId = updateRecipe.bind(null, id);

  return (
    <form action={updateWithId} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={recipe.title}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={recipe.description ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="ingredients" className="text-sm font-medium text-foreground">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          name="ingredients"
          rows={6}
          defaultValue={recipe.ingredients ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="instructions" className="text-sm font-medium text-foreground">
          Instructions
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={8}
          defaultValue={recipe.instructions ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_public"
          name="is_public"
          type="checkbox"
          defaultChecked={recipe.is_public}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <label htmlFor="is_public" className="text-sm font-medium text-foreground">
          Make this recipe public
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-5 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Save Changes
        </button>
        <Link
          href={`/dashboard/recipes/${id}`}
          className="px-5 py-2 rounded border border-border text-foreground font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
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
