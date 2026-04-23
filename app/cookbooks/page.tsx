import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { BookMarked } from "lucide-react";
import { CookbookCard } from "@/components/cookbook-card";
import { FollowButton } from "@/components/follow-button";

async function CookbookList() {
  const supabase = await createClient();

  const [{ data: cookbooks, error }, { data: claimsData }] = await Promise.all([
    supabase
      .from("cookbooks")
      .select(
        "id, name, description, is_public, created_by, profiles(name), cookbook_tags(tags(name)), cookbook_recipes(count)"
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false }),
    supabase.auth.getClaims(),
  ]);

  if (error) throw new Error(error.message);

  const userId = claimsData?.claims?.sub ?? null;

  if (!cookbooks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <BookMarked className="w-10 h-10" />
        <p>No cookbooks have been shared yet.</p>
      </div>
    );
  }

  // Batch-fetch follow counts + current user's follows
  const cookbookIds = cookbooks.map((c) => c.id);
  const [{ data: followCounts }, { data: userFollows }] = await Promise.all([
    supabase
      .from("cookbook_follows")
      .select("cookbook_id")
      .in("cookbook_id", cookbookIds),
    userId
      ? supabase
          .from("cookbook_follows")
          .select("cookbook_id")
          .eq("user_id", userId)
          .in("cookbook_id", cookbookIds)
      : Promise.resolve({ data: [] }),
  ]);

  const countMap = new Map<string, number>();
  for (const row of followCounts ?? []) {
    countMap.set(row.cookbook_id, (countMap.get(row.cookbook_id) ?? 0) + 1);
  }
  const followedSet = new Set((userFollows ?? []).map((r) => r.cookbook_id));

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
        const isOwner = userId === cookbook.created_by;

        return (
          <li key={cookbook.id} className="flex flex-col gap-1">
            <CookbookCard
              id={cookbook.id}
              name={cookbook.name}
              description={cookbook.description}
              isPublic={cookbook.is_public}
              creatorName={creatorName}
              tags={tags}
              recipeCount={recipeCount}
            />
            {userId && !isOwner && (
              <div className="flex justify-end">
                <FollowButton
                  type="cookbook"
                  targetId={cookbook.id}
                  initialFollowing={followedSet.has(cookbook.id)}
                  followerCount={countMap.get(cookbook.id) ?? 0}
                />
              </div>
            )}
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
