"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BookmarkButton } from "@/components/bookmark-button";
import { cn } from "@/lib/utils";
import type { FeedEvent } from "@/app/(public)/feed/actions";

interface FeedCardProps {
  event: FeedEvent;
  userId: string | null;
  isBookmarked: boolean;
  onTagClick?: (tag: string) => void;
}

function sourceContext(event: FeedEvent): React.ReactNode {
  if (event.event_type === "family_created") {
    return (
      <>
        Family created by{" "}
        <Link
          href={`/profile/${event.actor_id}`}
          className="font-medium hover:underline transition-colors"
        >
          {event.actor_name}
        </Link>
      </>
    );
  }
  if (event.event_type === "recipe_created") {
    return (
      <>
        Recipe created by{" "}
        <Link
          href={`/profile/${event.actor_id}`}
          className="font-medium hover:underline transition-colors"
        >
          {event.actor_name}
        </Link>
      </>
    );
  }
  if (event.event_type === "recipe_added_to_family") {
    return (
      <>
        Recipe added to{" "}
        {event.family_id !== null ? (
          <Link
            href={`/families/${event.family_id}`}
            className="font-semibold hover:underline transition-colors"
          >
            {event.family_name}
          </Link>
        ) : (
          <span className="font-semibold text-foreground">
            {event.family_name}
          </span>
        )}{" "}
        by{" "}
        <Link
          href={`/profile/${event.actor_id}`}
          className="font-medium hover:underline transition-colors"
        >
          {event.actor_name}
        </Link>
      </>
    );
  }
  if (event.event_type === "recipe_added_to_cookbook") {
    return (
      <>
        Recipe added to{" "}
        {event.cookbook_id !== null ? (
          <Link
            href={`/cookbooks/${event.cookbook_id}`}
            className="font-medium hover:underline transition-colors"
          >
            {event.cookbook_name}
          </Link>
        ) : (
          <span className="font-medium text-foreground">
            {event.cookbook_name}
          </span>
        )}{" "}
        cookbook by{" "}
        <Link
          href={`/profile/${event.actor_id}`}
          className="font-medium hover:underline transition-colors"
        >
          {event.actor_name}
        </Link>
      </>
    );
  }
  if (event.event_type === "cookbook_created") {
    return (
      <>
        Cookbook created by{" "}
        <Link
          href={`/profile/${event.actor_id}`}
          className="font-medium hover:underline transition-colors"
        >
          {event.actor_name}
        </Link>
      </>
    );
  }
  if (event.event_type === "cookbook_added_to_family") {
    return (
      <>
        Cookbook added to{" "}
        {event.family_id !== null ? (
          <Link
            href={`/families/${event.family_id}`}
            className="font-semibold hover:underline transition-colors"
          >
            {event.family_name}
          </Link>
        ) : (
          <span className="font-semibold text-foreground">
            {event.family_name}
          </span>
        )}{" "}
        family by{" "}
        <Link
          href={`/profile/${event.actor_id}`}
          className="font-medium hover:underline transition-colors"
        >
          {event.actor_name}
        </Link>
      </>
    );
  }
  return null;
}

export function FeedCard({ event, userId, isBookmarked, onTagClick }: FeedCardProps) {
  const isFamilyEvent = event.event_type === "family_created";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-5",
        "hover:border-accent/50 hover:shadow-sm transition-all"
      )}
    >
      {/* Source context */}
      <p className="text-xs text-muted-foreground">{sourceContext(event)}</p>

      {/* Title + description */}
      <div className="flex flex-col gap-1">
        {event.recipe_id !== null ? (
          <Link
            href={`/recipes/${event.recipe_id}?from=feed`}
            className="font-display font-semibold text-lg text-foreground hover:text-accent transition-colors leading-snug"
          >
            {event.recipe_title}
          </Link>
        ) : isFamilyEvent ? (
          <Link
            href={`/families/${event.family_id}?from=feed`}
            className="font-display font-semibold text-lg text-foreground hover:text-accent transition-colors leading-snug"
          >
            {event.family_name}
          </Link>
        ) : (
          <Link
            href={`/cookbooks/${event.cookbook_id}?from=feed`}
            className="font-display font-semibold text-lg text-foreground hover:text-accent transition-colors leading-snug"
          >
            {event.cookbook_name}
          </Link>
        )}
        {event.recipe_id !== null
          ? event.recipe_desc && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {event.recipe_desc}
              </p>
            )
          : !isFamilyEvent && event.cookbook_desc && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {event.cookbook_desc}
              </p>
            )}
      </div>

      {/* Tags */}
      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {event.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer: timestamp + bookmark */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(event.event_created_at), {
            addSuffix: true,
          })}
        </span>
        {userId !== null && event.recipe_id !== null && (
          <BookmarkButton
            recipeId={event.recipe_id!}
            initialBookmarked={isBookmarked}
          />
        )}
      </div>
    </div>
  );
}
