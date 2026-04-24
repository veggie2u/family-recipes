"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BookmarkButton } from "@/components/bookmark-button";
import { ReactionButton } from "@/components/reaction-button";
import { cn } from "@/lib/utils";
import type { FeedEvent, EventReactionData } from "@/app/(public)/feed/actions";

interface FeedCardProps {
  event: FeedEvent;
  userId: string | null;
  isBookmarked: boolean;
  onTagClick?: (tag: string) => void;
  reactionData?: EventReactionData;
}

function sourceContext(event: FeedEvent): React.ReactNode {
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
  if (event.event_type === "recipe_updated") {
    return (
      <>
        Recipe updated by{" "}
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
  if (event.event_type === "family_member_added") {
    return (
      <>
        <Link
          href={`/profile/${event.actor_id}`}
          className="font-medium hover:underline transition-colors"
        >
          {event.actor_name}
        </Link>
        {" joined "}
        {event.family_id !== null ? (
          <Link
            href={`/families/${event.family_id}`}
            className="font-semibold hover:underline transition-colors"
          >
            {event.family_name}
          </Link>
        ) : (
          <span className="font-semibold text-foreground">{event.family_name}</span>
        )}
      </>
    );
  }
  return null;
}

export function FeedCard({ event, userId, isBookmarked, onTagClick, reactionData }: FeedCardProps) {
  const isMemberEvent = event.event_type === "family_member_added";

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
        ) : isMemberEvent ? (
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
          : !isMemberEvent && event.cookbook_desc && (
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
              className="inline-flex items-center rounded-full border border-secondary px-2.5 py-0.5 text-xs font-semibold transition-colors bg-transparent text-secondary hover:bg-secondary/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer: reactions on left, timestamp + bookmark on right */}
      <div className="flex items-center justify-between mt-auto pt-1">
        {/* Reactions */}
        <div className="flex items-center gap-3">
          {reactionData && event.recipe_id !== null && (
            <>
              <ReactionButton
                entityType="recipe"
                entityId={event.recipe_id}
                reactionType="chefs_kiss"
                initialActive={reactionData.user_chefs_kiss}
                initialCount={reactionData.chefs_kiss_count}
                userId={userId}
              />
              <ReactionButton
                entityType="recipe"
                entityId={event.recipe_id}
                reactionType="made_it"
                initialActive={reactionData.user_made_it}
                initialCount={reactionData.made_it_count}
                userId={userId}
              />
            </>
          )}
          {reactionData &&
            !isMemberEvent &&
            event.recipe_id === null &&
            event.cookbook_id !== null && (
              <ReactionButton
                entityType="cookbook"
                entityId={event.cookbook_id}
                reactionType="chefs_kiss"
                initialActive={reactionData.user_chefs_kiss}
                initialCount={reactionData.chefs_kiss_count}
                userId={userId}
              />
            )}
        </div>

        {/* Timestamp + bookmark */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(event.event_created_at), {
              addSuffix: true,
            })}
          </span>
          {userId !== null && event.recipe_id !== null && (
            <BookmarkButton
              recipeId={event.recipe_id!}
              initialBookmarked={isBookmarked}
              initialBookmarkCount={event.bookmark_count}
            />
          )}
        </div>
      </div>
    </div>
  );
}
