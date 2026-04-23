"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = "← Back", className }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {label}
    </button>
  );
}
