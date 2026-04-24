"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getFeed } from "@/app/(public)/feed/actions";
import type { FeedEvent, EventReactionData } from "@/app/(public)/feed/actions";
import { searchGlobal } from "@/app/(public)/feed/search-actions";
import type { SearchResult } from "@/app/(public)/feed/search-actions";
import { FeedCard } from "@/components/feed-card";
import { Badge } from "@/components/ui/badge";

interface FeedListProps {
  initialEvents: FeedEvent[];
  initialCursor: string | null;
  filter: string;
  userId: string | null;
  initialBookmarkedIds: string[];
  initialReactionMap: Record<string, EventReactionData>;
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
  initialReactionMap,
}: FeedListProps) {
  const [events, setEvents] = useState<FeedEvent[]>(initialEvents);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCursor !== null);
  const [bookmarkedIds] = useState(() => new Set(initialBookmarkedIds));
  const [reactionMap, setReactionMap] = useState<Record<string, EventReactionData>>(initialReactionMap);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchGlobal(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function loadMore() {
    if (!cursor || isLoading) return;
    setIsLoading(true);
    try {
      const { events: newEvents, nextCursor, reactionMap: newReactionMap } = await getFeed({
        filter,
        cursor,
      });
      setEvents((prev) => [...prev, ...newEvents]);
      setCursor(nextCursor);
      setHasMore(nextCursor !== null);
      setReactionMap((prev) => ({ ...prev, ...newReactionMap }));
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
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search recipes, cookbooks, families, people…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter tabs — authenticated only, hidden during search */}
      {userId !== null && !searchQuery.trim() && (
        <div className="flex items-center gap-2 pb-4 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <a
              key={opt.value}
              href={opt.href}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary hover:text-secondary hover:bg-secondary/10"
              )}
            >
              {opt.label}
            </a>
          ))}
        </div>
      )}

      {/* Search results */}
      {searchQuery.trim() ? (
        <SearchResultsList results={searchResults} isSearching={isSearching} onTagClick={setSearchQuery} />
      ) : (
        <>
          {/* Event list */}
          {events.length > 0 ? (
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <FeedCard
                  key={event.event_id}
                  event={event}
                  userId={userId}
                  isBookmarked={event.recipe_id !== null && bookmarkedIds.has(event.recipe_id)}
                  onTagClick={setSearchQuery}
                  reactionData={reactionMap[event.event_id]}
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
        </>
      )}
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  recipe: "Recipe",
  cookbook: "Cookbook",
  family: "Family",
  user: "Person",
};

const TYPE_BADGE_CLASSES: Record<string, string> = {
  recipe: "border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400",
  cookbook: "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400",
  family: "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400",
  user: "border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400",
};

function getResultHref(result: SearchResult): string {
  switch (result.result_type) {
    case "recipe":
      return `/recipes/${result.id}`;
    case "cookbook":
      return `/cookbooks/${result.id}`;
    case "family":
      return `/families/${result.id}`;
    case "user":
      return `/profile/${result.id}`;
  }
}

function SearchResultCard({ result, onTagClick }: { result: SearchResult; onTagClick: (tag: string) => void }) {
  return (
    <Link
      href={getResultHref(result)}
      className={cn(
        "group flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4",
        "hover:border-accent/50 hover:shadow-sm transition-all"
      )}
    >
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "text-xs shrink-0",
            TYPE_BADGE_CLASSES[result.result_type] ?? ""
          )}
        >
          {TYPE_LABELS[result.result_type] ?? result.result_type}
        </Badge>
        <span className="font-medium text-foreground text-sm group-hover:underline line-clamp-1">
          {result.name}
        </span>
      </div>
      {result.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{result.description}</p>
      )}
      {result.creator_name && (
        <p className="text-xs text-muted-foreground">by {result.creator_name}</p>
      )}
      {(result.result_type === "recipe" || result.result_type === "cookbook") &&
        result.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5" onClick={(e) => e.preventDefault()}>
            {result.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="inline-flex items-center rounded-full border border-secondary px-2.5 py-0.5 text-xs font-semibold transition-colors bg-transparent text-secondary hover:bg-secondary/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
    </Link>
  );
}

function SearchResultsList({
  results,
  isSearching,
  onTagClick,
}: {
  results: SearchResult[];
  isSearching: boolean;
  onTagClick: (tag: string) => void;
}) {
  if (isSearching) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Search className="w-10 h-10" />
        <p>No results found.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {results.map((result) => (
        <li key={result.id}>
          <SearchResultCard result={result} onTagClick={onTagClick} />
        </li>
      ))}
    </ul>
  );
}
