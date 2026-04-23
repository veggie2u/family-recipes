"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getFeed } from "@/app/(public)/feed/actions";
import type { FeedEvent } from "@/app/(public)/feed/actions";
import { FeedCard } from "@/components/feed-card";

interface FeedListProps {
  initialEvents: FeedEvent[];
  initialCursor: string | null;
  filter: string;
  userId: string | null;
  initialBookmarkedIds: string[];
}

const FILTER_OPTIONS = [
  { value: "all", label: "All", href: "/feed" },
  { value: "families", label: "My Families", href: "/feed?filter=families" },
  { value: "following", label: "Following", href: "/feed?filter=following" },
  { value: "public", label: "Public", href: "/feed?filter=public" },
] as const;

const EMPTY_MESSAGES: Record<string, string> = {
  all: "No recipes in your feed yet. Create a recipe or join a family to get started.",
  families: "No recipes from your families yet. Invite members to start sharing.",
  following: "Follow a family or cookbook to see their recipes here.",
  public: "No public recipes yet. Be the first to share one!",
};

export function FeedList({
  initialEvents,
  initialCursor,
  filter,
  userId,
  initialBookmarkedIds,
}: FeedListProps) {
  const [events, setEvents] = useState<FeedEvent[]>(initialEvents);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCursor !== null);
  const [bookmarkedIds] = useState(() => new Set(initialBookmarkedIds));
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (!cursor || isLoading) return;
    setIsLoading(true);
    try {
      const { events: newEvents, nextCursor } = await getFeed({
        filter,
        cursor,
      });
      setEvents((prev) => [...prev, ...newEvents]);
      setCursor(nextCursor);
      setHasMore(nextCursor !== null);
      // Track any new bookmarked ids coming from server (none here, but keep set stable)
    } catch {
      toast.error("Failed to load more recipes.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading, cursor]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filter tabs — authenticated only */}
      {userId !== null && (
        <div className="flex items-center gap-2 border-b border-border pb-4 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <a
              key={opt.value}
              href={opt.href}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </a>
          ))}
        </div>
      )}

      {/* Event list */}
      {events.length > 0 ? (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <FeedCard
              key={event.event_id}
              event={event}
              userId={userId}
              isBookmarked={bookmarkedIds.has(event.recipe_id)}
            />
          ))}
        </div>
      ) : !isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
          {userId === null ? (
            <>
              <p className="text-muted-foreground text-lg max-w-sm">
                Sign up to see recipes from families and cookbooks you follow.
              </p>
              <a
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Sign up
              </a>
            </>
          ) : (
            <p className="text-muted-foreground text-lg max-w-sm">
              {EMPTY_MESSAGES[filter] ?? EMPTY_MESSAGES.all}
            </p>
          )}
        </div>
      ) : null}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
    </div>
  );
}
