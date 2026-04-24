"use client";

import { useState } from "react";
import Image from "next/image";
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
  /** "compact" = emoji/image + count with tooltip (default, used on cards).
   *  "circle"  = circular pill with image and description label (used on recipe detail). */
  variant?: "compact" | "circle";
}

const REACTION_CONFIG: Record<
  ReactionType,
  {
    image: string | null;
    emoji: string | null;
    label: string;
    description: string;
    activeClass: string;
    activeBgClass: string;
  }
> = {
  chefs_kiss: {
    image: "/chefskiss.png",
    emoji: null,
    label: "Chef's kiss reaction",
    description: "Chef's Kiss",
    activeClass: "text-primary border-primary",
    activeBgClass: "bg-primary/10",
  },
  made_it: {
    image: null,
    emoji: "🍽️",
    label: "Made it reaction",
    description: "I Made This",
    activeClass: "text-secondary border-secondary",
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
  variant = "compact",
}: ReactionButtonProps) {
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);
  const [justActivated, setJustActivated] = useState(false);

  const { image, emoji, label, description, activeClass, activeBgClass } =
    REACTION_CONFIG[reactionType];

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

    setActive(!prevActive);
    setCount(prevActive ? prevCount - 1 : prevCount + 1);
    setIsPending(true);

    if (!prevActive && variant === "circle") {
      setJustActivated(true);
      setTimeout(() => setJustActivated(false), 500);
    }

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

  const graphic = image ? (
    <Image src={image} alt="" width={22} height={22} unoptimized className="w-5 h-5 object-contain [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.3))]" />
  ) : (
    <span className="text-lg leading-none [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.3))]">{emoji}</span>
  );

  const circleGraphic = image ? (
    <Image
      src={image}
      alt=""
      width={22}
      height={22}
      unoptimized
      className={cn(
        "w-5 h-5 object-contain [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.3))]",
        justActivated && "[animation:reaction-pop_0.5s_ease-in-out]"
      )}
    />
  ) : (
    <span
      className={cn(
        "text-lg leading-none [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.3))]",
        justActivated && "[animation:reaction-pop_0.5s_ease-in-out]"
      )}
    >
      {emoji}
    </span>
  );

  if (variant === "circle") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 w-20 h-20 rounded-full border transition-colors",
          active
            ? cn(activeClass, activeBgClass)
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
          isPending && "opacity-50 cursor-not-allowed",
          justActivated && "[animation:reaction-bounce_0.5s_ease-in-out]",
          className
        )}
      >
        <span className="flex items-center gap-1">
          {circleGraphic}
          <span className="text-xs font-semibold tabular-nums">{count}</span>
        </span>
        <span className="text-[10px] leading-tight text-center px-1">{description}</span>
      </button>
    );
  }

  // compact variant — emoji/image + count with tooltip
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
              ? activeClass
              : "text-muted-foreground",
            isPending && "opacity-50 cursor-not-allowed",
          )}
        >
          {graphic}
          <span className="text-xs tabular-nums">{count}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
