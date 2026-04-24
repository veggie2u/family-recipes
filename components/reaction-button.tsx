"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleReaction } from "@/app/actions/reactions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ReactionType = "chefs_kiss" | "made_it";
type EntityType = "recipe" | "cookbook";

interface ReactionButtonProps {
  entityType: EntityType;
  entityId: string;
  reactionType: ReactionType;
  initialActive: boolean;
  initialCount: number;
  userId: string | null;
  className?: string;
}

const REACTION_CONFIG: Record<
  ReactionType,
  { emoji: string; label: string; tooltip: string; activeClass: string; activeBgClass: string }
> = {
  chefs_kiss: {
    emoji: "👨‍🍳",
    label: "Chef's kiss reaction",
    tooltip: "Chef's kiss",
    activeClass: "text-primary border-primary font-medium",
    activeBgClass: "bg-primary/10",
  },
  made_it: {
    emoji: "🍽️",
    label: "Made it reaction",
    tooltip: "I made this",
    activeClass: "text-secondary border-secondary font-medium",
    activeBgClass: "bg-secondary/10",
  },
};

export function ReactionButton({
  entityType,
  entityId,
  reactionType,
  initialActive,
  initialCount,
  userId,
  className,
}: ReactionButtonProps) {
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  const { emoji, label, tooltip, activeClass, activeBgClass } = REACTION_CONFIG[reactionType];

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.info("Sign in to react to recipes");
      return;
    }

    if (isPending) return;

    const prevActive = active;
    const prevCount = count;

    // Optimistic update
    setActive(!prevActive);
    setCount(prevActive ? prevCount - 1 : prevCount + 1);
    setIsPending(true);

    try {
      const result = await toggleReaction(entityType, entityId, reactionType);
      setActive(result.active);
      setCount(result.count);
    } catch {
      setActive(prevActive);
      setCount(prevCount);
      toast.error("Failed to save reaction.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          disabled={isPending}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            className,
            active
              ? cn(activeClass, activeBgClass)
              : "text-muted-foreground",
            isPending && "opacity-50 cursor-not-allowed",
          )}
        >
          <span className="[filter:drop-shadow(0_0_1px_rgba(0,0,0,0.35))]">{emoji}</span>
          <span className="text-xs tabular-nums">{count}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
