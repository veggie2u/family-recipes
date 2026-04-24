import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { FeedList } from "@/components/feed-list";
import { CreateDropdown } from "@/components/create-dropdown";
import type { FeedEvent } from "@/app/(public)/feed/actions";

async function FeedContent({ filter }: { filter: string | undefined }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;
  const activeFilter = filter ?? "all";

  const { data: rawEvents, error } = await supabase.rpc("get_feed", {
    p_user_id: userId,
    p_cursor: new Date().toISOString(),
    p_limit: 20,
    p_filter: userId ? activeFilter : "all",
  });
  if (error) throw error;

  const baseEvents = (rawEvents ?? []) as Omit<FeedEvent, "bookmark_count">[];
  const nextCursor =
    baseEvents.length === 20 ? baseEvents[baseEvents.length - 1].event_created_at : null;

  // Batch-fetch bookmark counts + user bookmark state in parallel
  const recipeIds = baseEvents
    .map((e) => e.recipe_id)
    .filter((id): id is string => id !== null);

  const [bookmarkRows, userBookmarkRows] = await Promise.all([
    recipeIds.length > 0
      ? supabase.from("recipe_bookmarks").select("recipe_id").in("recipe_id", recipeIds)
      : Promise.resolve({ data: [] as { recipe_id: string }[] }),
    userId
      ? supabase.from("recipe_bookmarks").select("recipe_id").eq("user_id", userId)
      : Promise.resolve({ data: [] as { recipe_id: string }[] }),
  ]);

  const bookmarkCountMap = new Map<string, number>();
  for (const row of bookmarkRows.data ?? []) {
    bookmarkCountMap.set(row.recipe_id, (bookmarkCountMap.get(row.recipe_id) ?? 0) + 1);
  }

  const initialBookmarkedIds = (userBookmarkRows.data ?? []).map((b) => b.recipe_id);

  const events: FeedEvent[] = baseEvents.map((e) => ({
    ...e,
    bookmark_count: e.recipe_id !== null ? (bookmarkCountMap.get(e.recipe_id) ?? 0) : 0,
  }));

  return (
    <FeedList
      initialEvents={events}
      initialCursor={nextCursor}
      filter={activeFilter}
      userId={userId}
      initialBookmarkedIds={initialBookmarkedIds}
    />
  );
}

async function FeedHeader() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const isAuthenticated = !!claimsData?.claims;

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Feed</h1>
        <p className="text-muted-foreground mt-1">
          Discover recipes from your families and the community.
        </p>
      </div>
      {isAuthenticated && <CreateDropdown />}
    </div>
  );
}

export default function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense
        fallback={
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Feed</h1>
              <p className="text-muted-foreground mt-1">
                Discover recipes from your families and the community.
              </p>
            </div>
          </div>
        }
      >
        <FeedHeader />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <FeedContentWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FeedContentWrapper({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  return <FeedContent filter={filter} />;
}
