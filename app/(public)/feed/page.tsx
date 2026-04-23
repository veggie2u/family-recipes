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

  const events = (rawEvents ?? []) as FeedEvent[];
  const nextCursor = events.length === 20 ? events[events.length - 1].event_created_at : null;

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
