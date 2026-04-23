import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { FeedList } from "@/components/feed-list";
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

  const events = (rawEvents ?? []) as Omit<FeedEvent, "tags">[];

  let eventsWithTags: FeedEvent[] = [];
  if (events.length > 0) {
    const recipeIds = events.map((e) => e.recipe_id);
    const { data: tagRows } = await supabase
      .from("recipe_tags")
      .select("recipe_id, tags(name)")
      .in("recipe_id", recipeIds);

    const tagMap = new Map<string, string[]>();
    for (const row of tagRows ?? []) {
      const names =
        (row.tags as unknown as { name: string }[])?.map((t) => t.name) ?? [];
      tagMap.set(row.recipe_id, names);
    }
    eventsWithTags = events.map((e) => ({
      ...e,
      tags: tagMap.get(e.recipe_id) ?? [],
    }));
  }

  const nextCursor =
    events.length === 20
      ? events[events.length - 1].event_created_at
      : null;

  let initialBookmarkedIds: string[] = [];
  if (userId) {
    const { data: bookmarks } = await supabase
      .from("recipe_bookmarks")
      .select("recipe_id")
      .eq("user_id", userId);
    initialBookmarkedIds = bookmarks?.map((b) => b.recipe_id) ?? [];
  }

  return (
    <FeedList
      initialEvents={eventsWithTags}
      initialCursor={nextCursor}
      filter={activeFilter}
      userId={userId}
      initialBookmarkedIds={initialBookmarkedIds}
    />
  );
}

export default function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Feed</h1>
        <p className="text-muted-foreground mt-1">
          Discover recipes from your families and the community.
        </p>
      </div>

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
