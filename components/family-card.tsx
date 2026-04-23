import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FamilyCardProps {
  id: string;
  name: string;
  isPublic?: boolean;
  memberCount?: number;
  href?: string;
}

export function FamilyCard({ id, name, isPublic, memberCount, href }: FamilyCardProps) {
  return (
    <Link
      href={href ?? `/families/${id}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border bg-card p-5",
        "hover:border-accent/50 hover:shadow-sm transition-all"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            "font-display font-semibold text-lg text-foreground",
            "group-hover:text-accent transition-colors leading-snug"
          )}
        >
          {name}
        </h3>
        {isPublic !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5",
              isPublic
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isPublic ? (
              <>
                <Globe className="w-3 h-3" /> Public
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Private
              </>
            )}
          </span>
        )}
      </div>
      {memberCount !== undefined && (
        <p className={cn("text-xs text-muted-foreground mt-auto pt-1")}>
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      )}
    </Link>
  );
}
