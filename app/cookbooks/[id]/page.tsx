import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/recipe-card";
import { BackButton } from "@/components/back-button";
import { cn } from "@/lib/utils";

// ─── Data-fetching component ──────────────────────────────────────────────────

async function CookbookDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  const { data: cookbook, error } = await supabase
    .from("cookbooks")
    .select(
      "id, name, description, is_public, created_by, profiles(name), cookbook_tags(tags(name)), cookbook_recipes(recipes(id, title, description, is_public))"
    )
    .eq("id", id)
    .single();

  if (error || !cookbook) {
    notFound();
  }

  const isOwner = userId !== null && cookbook.created_by === userId;

  // Private cookbooks are only visible to the creator
  if (!cookbook.is_public && !isOwner) {
    notFound();
  }

  // Creator name
  const creatorName =
    (cookbook.profiles as unknown as { name: string | null } | null)?.name ??
    null;

  // Tags
  const tags: string[] =
    cookbook.cookbook_tags?.flatMap(
      (ct: { tags: { name: string } | { name: string }[] | null }) =>
        Array.isArray(ct.tags)
          ? ct.tags.map((t) => t.name)
          : ct.tags
            ? [ct.tags.name]
            : []
    ) ?? [];

  // Recipes — only public ones for non-owners
  type RecipeRow = {
    id: string;
    title: string;
    description: string | null;
    is_public: boolean;
  };

  const allRecipes = (cookbook.cookbook_recipes ?? [])
    .map(
      (cr: {
        recipes: RecipeRow | RecipeRow[] | null;
      }) => cr.recipes
    )
    .flat()
    .filter((r): r is NonNullable<RecipeRow> => r != null) as RecipeRow[];

  const recipes = isOwner
    ? allRecipes
    : allRecipes.filter((r) => r.is_public);

  return (
    <article className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span
          className={cn(
            "self-start flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
            cookbook.is_public
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {cookbook.is_public ? (
            <>
              <Globe className="w-3 h-3" /> Public
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" /> Private
            </>
          )}
        </span>

        <h1 className="font-display text-3xl font-bold text-foreground">
          {cookbook.name}
        </h1>

        {creatorName && (
          <p
            className={cn(
              "text-sm",
              isOwner ? "text-accent/70" : "text-muted-foreground"
            )}
          >
            {isOwner ? "Your cookbook" : `By ${creatorName}`}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {cookbook.description && (
        <p className="text-muted-foreground text-lg leading-relaxed">
          {cookbook.description}
        </p>
      )}

      {/* Recipes */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-xl text-foreground">Recipes</h2>
          <span className="text-sm text-muted-foreground">
            ({recipes.length})
          </span>
        </div>

        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No public recipes in this cookbook yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                description={recipe.description}
                isPublic={recipe.is_public}
                href={`/recipes/${recipe.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CookbookDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-5 w-16 rounded-full bg-muted" />
      <div className="h-9 w-2/3 rounded bg-muted" />
      <div className="h-4 w-1/4 rounded bg-muted" />
      <div className="h-16 rounded bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicCookbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <BackButton label="← Back to cookbooks" />
      </div>
      <Suspense fallback={<CookbookDetailSkeleton />}>
        <CookbookDetailContent params={params} />
      </Suspense>
    </div>
  );
}
