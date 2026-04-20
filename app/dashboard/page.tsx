import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeCard } from "@/components/recipe-card";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function RecipeList() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, description, is_public, created_by")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground text-lg">No recipes yet.</p>
        <Link
          href="/dashboard/recipes/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="w-4 h-4" />
          Add your first recipe
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          id={recipe.id}
          title={recipe.title}
          description={recipe.description}
          isPublic={recipe.is_public}
          isOwner={recipe.created_by === userId}
        />
      ))}
    </div>
  );
}

function RecipeListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Recipes
          </h1>
          <p className="text-muted-foreground mt-1">
            Your collection of family recipes
          </p>
        </div>
        <Link
          href="/dashboard/recipes/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="w-4 h-4" />
          Add Recipe
        </Link>
      </div>

      <Suspense fallback={<RecipeListSkeleton />}>
        <RecipeList />
      </Suspense>
    </div>
  );
}
