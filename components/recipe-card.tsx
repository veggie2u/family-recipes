import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import { RecipeTag } from "@/components/ui/recipe-tag";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  id: string;
  title: string;
  description: string | null;
  /** When provided, renders a public/private badge. Omit to hide the badge. */
  isPublic?: boolean;
  /** When true, shows "Your recipe" instead of creatorName. */
  isOwner?: boolean;
  /** Name of the recipe creator. Shown when isOwner is false. */
  creatorName?: string;
  /** Link destination. Defaults to /recipes/:id */
  href?: string;
  tags?: string[];
  /** Extra classes merged onto the root Link element (e.g. "flex-1" for equal-height grids). */
  className?: string;
  /** Optional slot rendered inline on the right of the bottom row (e.g. BookmarkButton). */
  bookmarkSlot?: React.ReactNode;
  /** Optional slot rendered left of bookmarkSlot in the bottom row (e.g. remove button). */
  removeSlot?: React.ReactNode;
  /** Optional slot rendered left of removeSlot in the bottom row (e.g. reaction buttons). */
  reactionSlot?: React.ReactNode;
}

export function RecipeCard({
  id,
  title,
  description,
  isPublic,
  isOwner,
  creatorName,
  href,
  tags = [],
  className,
  bookmarkSlot,
  removeSlot,
  reactionSlot,
}: RecipeCardProps) {
  const byline = isOwner ? "Your recipe" : creatorName;
  const hasFooter = byline || bookmarkSlot || removeSlot || reactionSlot;

  return (
    <Link
      href={href ?? `/recipes/${id}`}
      className={cn("group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 hover:border-accent/50 hover:shadow-sm transition-all", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors leading-snug">
          {title}
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
      {hasFooter && (
        <div className="flex items-center justify-between mt-auto pt-1">
          {byline ? (
            <p className={`text-xs ${isOwner ? "text-accent/70" : "text-muted-foreground"}`}>
              {byline}
            </p>
          ) : (
            <span />
          )}
          {(reactionSlot || removeSlot || bookmarkSlot) && (
            <div className="flex items-center gap-1">
              {reactionSlot}
              {removeSlot}
              {bookmarkSlot}
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
