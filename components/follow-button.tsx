"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  followFamily,
  unfollowFamily,
  followCookbook,
  unfollowCookbook,
} from "@/app/actions/follow-actions";

interface FollowButtonProps {
  type: "family" | "cookbook";
  targetId: string;
  initialFollowing: boolean;
  followerCount: number;
  className?: string;
}

export function FollowButton({
  type,
  targetId,
  initialFollowing,
  followerCount,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (isPending) return;

    const prev = isFollowing;
    const prevCount = count;
    setIsFollowing(!prev);
    setCount(prev ? count - 1 : count + 1);
    setIsPending(true);

    try {
      if (prev) {
        await (type === "family" ? unfollowFamily(targetId) : unfollowCookbook(targetId));
      } else {
        await (type === "family" ? followFamily(targetId) : followCookbook(targetId));
      }
    } catch {
      setIsFollowing(prev);
      setCount(prevCount);
      toast.error(prev ? "Failed to unfollow." : "Failed to follow.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFollowing ? `Unfollow this ${type}` : `Follow this ${type}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-medium transition-colors",
        isFollowing
          ? "border-border bg-muted text-foreground hover:bg-muted/80"
          : "border-primary bg-primary text-primary-foreground hover:opacity-90",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isFollowing ? (
        <UserCheck className="w-3.5 h-3.5" />
      ) : (
        <UserPlus className="w-3.5 h-3.5" />
      )}
      {isFollowing ? "Following" : "Follow"}
      <span className="text-xs opacity-70">
        {count === 1 ? "· 1" : `· ${count}`}
      </span>
    </button>
  );
}
