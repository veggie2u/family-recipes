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
  className?: string;
}

export function BookmarkButton({
  recipeId,
  initialBookmarked,
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, setIsPending] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    const prev = isBookmarked;
    setIsBookmarked(!prev);
    setIsPending(true);

    try {
      if (prev) {
        await removeBookmark(recipeId);
      } else {
        await bookmarkRecipe(recipeId);
      }
    } catch {
      setIsBookmarked(prev);
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
        "flex items-center justify-center rounded p-1 transition-colors",
        "text-muted-foreground hover:text-foreground",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Bookmark
        className={cn(
          "h-4 w-4 transition-colors",
          isBookmarked && "fill-current text-primary"
        )}
      />
    </button>
  );
}
