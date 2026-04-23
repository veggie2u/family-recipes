import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { BookMarked } from "lucide-react";
import { CookbookCard } from "@/components/cookbook-card";

async function CookbookList() {
  const supabase = await createClient();

  const { data: cookbooks, error } = await supabase
    .from("cookbooks")
    .select(
      "id, name, description, is_public, created_by, profiles(name), cookbook_tags(tags(name)), cookbook_recipes(count)"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  if (!cookbooks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <BookMarked className="w-10 h-10" />
        <p>No cookbooks have been shared yet.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cookbooks.map((cookbook) => {
        const creatorName =
          (cookbook.profiles as unknown as { name: string | null } | null)
            ?.name ?? undefined;
        const tags: string[] =
          cookbook.cookbook_tags?.flatMap(
            (ct: {
              tags: { name: string } | { name: string }[] | null;
            }) =>
              Array.isArray(ct.tags)
                ? ct.tags.map((t) => t.name)
                : ct.tags
                  ? [ct.tags.name]
                  : []
          ) ?? [];
        const recipeCount =
          (
            cookbook.cookbook_recipes as unknown as
              | { count: number }[]
              | null
          )?.[0]?.count ?? 0;

        return (
          <li key={cookbook.id}>
            {/* No public single-cookbook view yet — links to dashboard view for now */}
            <CookbookCard
              id={cookbook.id}
              name={cookbook.name}
              description={cookbook.description}
              isPublic={cookbook.is_public}
              creatorName={creatorName}
              tags={tags}
              recipeCount={recipeCount}
            />
          </li>
        );
      })}
    </ul>
  );
}

function CookbookListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function PublicCookbooksPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Cookbooks
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse cookbooks shared by the community.
        </p>
      </div>

      <Suspense fallback={<CookbookListSkeleton />}>
        <CookbookList />
      </Suspense>
    </div>
  );
}
