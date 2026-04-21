import Link from "next/link";
import { Globe, Lock } from "lucide-react";

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
  /** Link destination. Defaults to /dashboard/recipes/:id */
  href?: string;
}

export function RecipeCard({
  id,
  title,
  description,
  isPublic,
  isOwner,
  creatorName,
  href,
}: RecipeCardProps) {
  const byline = isOwner ? "Your recipe" : creatorName;

  return (
    <Link
      href={href ?? `/dashboard/recipes/${id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 hover:border-accent/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors leading-snug">
          {title}
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
      {byline && (
        <p className={`text-xs mt-auto pt-1 ${isOwner ? "text-accent/70" : "text-muted-foreground"}`}>{byline}</p>
      )}
    </Link>
  );
}
