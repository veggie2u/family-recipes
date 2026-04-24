import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { FeedList } from "@/components/feed-list";
import { CreateDropdown } from "@/components/create-dropdown";
import { getFeed } from "@/app/(public)/feed/actions";
import { PendingInvitesBanner } from "@/components/pending-invites-banner";

async function FeedContent({ filter }: { filter: string | undefined }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;
  const activeFilter = filter ?? "all";

  const { events, nextCursor, reactionMap, initialBookmarkedIds } = await getFeed({
    filter: activeFilter,
  });

  return (
    <FeedList
      initialEvents={events}
      initialCursor={nextCursor}
      filter={activeFilter}
      userId={userId}
      initialBookmarkedIds={initialBookmarkedIds}
      initialReactionMap={reactionMap}
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

      <Suspense fallback={null}>
        <PendingInvitesBanner />
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
