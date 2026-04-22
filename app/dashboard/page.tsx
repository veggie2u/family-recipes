import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeCard } from "@/components/recipe-card";
import { CookbookCard } from "@/components/cookbook-card";
import { RecipeSearchInput } from "@/components/recipe-search-input";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function RecipeList({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;
  const { q: query } = await searchParams;

  let request = supabase
    .from("recipes")
    .select("id, title, description, is_public, created_by, profiles(name), recipe_tags(tags(name))")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (query) {
    const { data: matchingTags } = await supabase
      .from("tags")
      .select("id")
      .ilike("name", `%${query}%`);
    const matchingTagIds = matchingTags?.map((t) => t.id) ?? [];

    let tagMatchedIds: string[] = [];
    if (matchingTagIds.length > 0) {
      const { data: junctionRows } = await supabase
        .from("recipe_tags")
        .select("recipe_id")
        .in("tag_id", matchingTagIds);
      tagMatchedIds = junctionRows?.map((r) => r.recipe_id) ?? [];
    }

    const conditions = [`title.ilike.%${query}%`, `description.ilike.%${query}%`];
    if (tagMatchedIds.length > 0) {
      conditions.push(`id.in.(${tagMatchedIds.join(",")})`);
    }
    request = request.or(conditions.join(","));
  }

  const { data: recipes, error } = await request;

  if (error) throw new Error(error.message);

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
        {query ? (
          <p className="text-muted-foreground text-lg">No recipes found for &ldquo;{query}&rdquo;</p>
        ) : (
          <>
            <p className="text-muted-foreground text-lg">No recipes yet.</p>
            <Link
              href="/dashboard/recipes/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <PlusIcon className="w-4 h-4" />
              Add your first recipe
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map((recipe) => {
        const tags = recipe.recipe_tags?.flatMap((rt: { tags: { name: string } | { name: string }[] | null }) =>
          Array.isArray(rt.tags) ? rt.tags.map((t) => t.name) : rt.tags ? [rt.tags.name] : []
        ) ?? [];
        return (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description}
            isPublic={recipe.is_public}
            isOwner={recipe.created_by === userId}
            creatorName={(recipe.profiles as unknown as { name: string | null } | null)?.name ?? undefined}
            tags={tags}
          />
        );
      })}
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

async function CookbookList({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;
  const { q: query } = await searchParams;

  let request = supabase
    .from("cookbooks")
    .select("id, name, description, is_public, created_by, cookbook_tags(tags(name))")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (query) {
    const { data: matchingTags } = await supabase
      .from("tags")
      .select("id")
      .ilike("name", `%${query}%`);
    const matchingTagIds = matchingTags?.map((t) => t.id) ?? [];

    let tagMatchedIds: string[] = [];
    if (matchingTagIds.length > 0) {
      const { data: junctionRows } = await supabase
        .from("cookbook_tags")
        .select("cookbook_id")
        .in("tag_id", matchingTagIds);
      tagMatchedIds = junctionRows?.map((r) => r.cookbook_id) ?? [];
    }

    const conditions = [`name.ilike.%${query}%`, `description.ilike.%${query}%`];
    if (tagMatchedIds.length > 0) {
      conditions.push(`id.in.(${tagMatchedIds.join(",")})`);
    }
    request = request.or(conditions.join(","));
  }

  const { data: cookbooks, error } = await request;

  if (error) throw new Error(error.message);

  if (!cookbooks || cookbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
        {query ? (
          <p className="text-muted-foreground text-lg">No cookbooks found for &ldquo;{query}&rdquo;</p>
        ) : (
          <>
            <p className="text-muted-foreground text-lg">No cookbooks yet.</p>
            <Link
              href="/dashboard/cookbooks/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <PlusIcon className="w-4 h-4" />
              Create your first cookbook
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cookbooks.map((cookbook) => {
        const tags = cookbook.cookbook_tags?.flatMap((ct: { tags: { name: string } | { name: string }[] | null }) =>
          Array.isArray(ct.tags) ? ct.tags.map((t) => t.name) : ct.tags ? [ct.tags.name] : []
        ) ?? [];
        return (
          <CookbookCard
            key={cookbook.id}
            id={cookbook.id}
            name={cookbook.name}
            description={cookbook.description}
            isPublic={cookbook.is_public}
            isOwner={cookbook.created_by === userId}
            tags={tags}
          />
        );
      })}
    </div>
  );
}

function CookbookListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense>
        <RecipeSearchInput placeholder="Search recipes and cookbooks…" />
      </Suspense>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            My Recipes
          </h1>
          <p className="text-muted-foreground mt-1">
            Your collection of family recipes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/recipes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Browse all recipes
          </Link>
          <Link
            href="/dashboard/recipes/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-4 h-4" />
            Add Recipe
          </Link>
        </div>
      </div>

      <Suspense fallback={<RecipeListSkeleton />}>
        <RecipeList searchParams={searchParams} />
      </Suspense>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            My Cookbooks
          </h2>
          <p className="text-muted-foreground mt-1">
            Your curated collections of recipes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cookbooks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Browse all cookbooks
          </Link>
          <Link
            href="/dashboard/cookbooks/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-4 h-4" />
            Add Cookbook
          </Link>
        </div>
      </div>

      <Suspense fallback={<CookbookListSkeleton />}>
        <CookbookList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
