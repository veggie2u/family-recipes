"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const FROM_LABELS: Record<string, string> = {
  feed: "Feed",
  recipes: "Recipes",
  cookbooks: "Cookbooks",
  cookbook: "Cookbook",
  bookmarks: "Bookmarks",
  family: "Family",
};

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = "← Back", className }: BackButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const displayLabel = from && FROM_LABELS[from]
    ? `← Back to ${FROM_LABELS[from]}`
    : label;

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "self-start text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {displayLabel}
    </button>
  );
}
