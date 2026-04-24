"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  bookmarkRecipe,
  removeBookmark,
} from "@/app/(auth)/bookmarks/actions";

interface BookmarkButtonProps {
  recipeId: string;
  initialBookmarked: boolean;
  /** Total bookmark count to display inside the button. */
  initialBookmarkCount?: number;
  className?: string;
}

export function BookmarkButton({
  recipeId,
  initialBookmarked,
  initialBookmarkCount,
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount ?? 0);
  const [isPending, setIsPending] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    const prev = isBookmarked;
    setIsBookmarked(!prev);
    if (initialBookmarkCount !== undefined) {
      setBookmarkCount((c) => (prev ? Math.max(0, c - 1) : c + 1));
    }
    setIsPending(true);

    try {
      if (prev) {
        await removeBookmark(recipeId);
      } else {
        await bookmarkRecipe(recipeId);
      }
    } catch {
      setIsBookmarked(prev);
      if (initialBookmarkCount !== undefined) {
        setBookmarkCount(initialBookmarkCount);
      }
      toast.error(
        prev ? "Failed to remove bookmark." : "Failed to bookmark recipe."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark recipe"}
      className={cn(
        "flex items-center gap-1.5 rounded px-2 py-1 transition-colors text-sm",
        "text-muted-foreground hover:text-foreground",
        isBookmarked && "text-primary",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Bookmark
        className={cn(
          "h-4 w-4 transition-colors",
          isBookmarked && "fill-current"
        )}
      />
      {initialBookmarkCount !== undefined && (
        <span className="tabular-nums">{bookmarkCount}</span>
      )}
    </button>
  );
}
