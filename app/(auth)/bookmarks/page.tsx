import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Bookmark } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import { BookmarkButton } from "@/components/bookmark-button";
import { cn } from "@/lib/utils";

type BookmarkedRecipe = {
  recipe_id: string;
  bookmarked_at: string;
  recipes: {
    id: string;
    title: string;
    description: string | null;
    created_by: string;
    profiles: { name: string | null } | null;
    recipe_tags: Array<{ tags: { name: string } | { name: string }[] | null }>;
  } | null;
};

async function BookmarksContent({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  // Fetch all bookmarked recipes with recipe data + tags
  const { data: rawBookmarks } = await supabase
    .from("recipe_bookmarks")
    .select(
      "recipe_id, bookmarked_at, recipes(id, title, description, created_by, profiles(name), recipe_tags(tags(name)))"
    )
    .eq("user_id", userId)
    .order("bookmarked_at", { ascending: false });

  const bookmarks = (rawBookmarks ?? []) as unknown as BookmarkedRecipe[];

  // Build tag data and apply filter
  type RecipeWithTags = {
    id: string;
    title: string;
    description: string | null;
    created_by: string;
    profiles: { name: string | null } | null;
    tags: string[];
  };

  const recipesWithTags: RecipeWithTags[] = bookmarks
    .filter((b) => b.recipes != null)
    .map((b) => {
      const recipe = b.recipes!;
      const tags: string[] =
        recipe.recipe_tags?.flatMap(
          (rt: { tags: { name: string } | { name: string }[] | null }) =>
            Array.isArray(rt.tags)
              ? rt.tags.map((t) => t.name)
              : rt.tags
                ? [rt.tags.name]
                : []
        ) ?? [];
      return { ...recipe, tags };
    });

  // All distinct tags across bookmarks (for the filter pills)
  const allTags = Array.from(
    new Set(recipesWithTags.flatMap((r) => r.tags))
  ).sort();

  // Filter by tag if provided
  const filtered = tag
    ? recipesWithTags.filter((r) => r.tags.includes(tag))
    : recipesWithTags;

  return (
    <div className="flex flex-col gap-6">
      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <a
            href="/bookmarks"
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
              !tag
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All
          </a>
          {allTags.map((t) => (
            <a
              key={t}
              href={`/bookmarks?tag=${encodeURIComponent(t)}`}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
                tag === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {t}
            </a>
          ))}
        </div>
      )}

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
          <Bookmark className="w-10 h-10 text-muted-foreground" />
          {tag ? (
            <>
              <p className="text-muted-foreground text-lg">
                No bookmarked recipes tagged &ldquo;{tag}&rdquo;.
              </p>
              <a
                href="/bookmarks"
                className="text-sm text-accent hover:underline"
              >
                View all bookmarks
              </a>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-lg">
                No bookmarked recipes yet.
              </p>
              <a
                href="/recipes"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Browse recipes
              </a>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              isOwner={recipe.created_by === userId}
              creatorName={
                (recipe.profiles as unknown as { name: string | null } | null)
                  ?.name ?? undefined
              }
              tags={recipe.tags}
              href={`/recipes/${recipe.id}?from=bookmarks`}
              bookmarkSlot={<BookmarkButton recipeId={recipe.id} initialBookmarked={true} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Recipes you&apos;ve saved for later.</p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse" />
            ))}
          </div>
        }
      >
        <BookmarksContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

