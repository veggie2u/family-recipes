import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import { RecipeTag } from "@/components/ui/recipe-tag";

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
  /** Link destination. Defaults to /cookbooks/:id */
  href?: string;
  /** Optional slot rendered in the footer row (e.g. remove button). */
  removeSlot?: React.ReactNode;
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
  href,
  removeSlot,
}: CookbookCardProps) {
  const byline = isOwner ? "Your cookbook" : creatorName;
  return (
    <Link
      href={href ?? `/cookbooks/${id}`}
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
                ? "border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/40"
                : "border border-border text-muted-foreground"
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
            <RecipeTag key={tag} tagText={tag} />
          ))}
        </div>
      )}
      {(byline || removeSlot || recipeCount !== undefined) && (
        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="flex flex-col gap-1">
            {byline && (
              <p className={`text-xs ${isOwner ? "text-accent/70" : "text-muted-foreground"}`}>{byline}</p>
            )}
            {recipeCount !== undefined && (
              <span className="text-xs text-muted-foreground">
                {recipeCount === 1 ? "1 recipe" : `${recipeCount} recipes`}
              </span>
            )}
          </div>
          {removeSlot}
        </div>
      )}
    </Link>
  );
}
