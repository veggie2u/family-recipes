import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CookbookCardProps {
  id: string;
  name: string;
  description: string | null;
  isPublic?: boolean;
  isOwner?: boolean;
  /** Name of the cookbook creator. Shown when isOwner is false. */
  creatorName?: string;
  tags?: string[];
  recipeCount?: number;
}

export function CookbookCard({
  id,
  name,
  description,
  isPublic,
  isOwner,
  creatorName,
  tags = [],
  recipeCount,
}: CookbookCardProps) {
  const byline = isOwner ? "Your cookbook" : creatorName;
  return (
    <Link
      href={`/cookbooks/${id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 hover:border-accent/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors leading-snug">
          {name}
        </h3>
        {isPublic !== undefined && (
          <span
            className={`flex items-center gap-1 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${
              isPublic
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
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
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {byline && (
        <p className={`text-xs mt-auto pt-1 ${isOwner ? "text-accent/70" : "text-muted-foreground"}`}>{byline}</p>
      )}
      {recipeCount !== undefined && (
        <div className="mt-auto border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {recipeCount === 1 ? "1 recipe" : `${recipeCount} recipes`}
          </span>
        </div>
      )}
    </Link>
  );
}
