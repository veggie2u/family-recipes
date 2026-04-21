import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecipeDetailProps {
  title: string;
  description?: string | null;
  ingredients?: string | null;
  instructions?: string | null;
  /** When provided, renders the public/private badge. */
  isPublic?: boolean;
  /** When true, shows "Your recipe" in accent colour. */
  isOwner?: boolean;
  /** Creator's display name. Shown when isOwner is false. */
  creatorName?: string;
  tags?: string[];
  /** Optional action buttons (e.g. Edit / Delete) rendered in the header. */
  actions?: React.ReactNode;
}

export function RecipeDetail({
  title,
  description,
  ingredients,
  instructions,
  isPublic,
  isOwner,
  creatorName,
  tags = [],
  actions,
}: RecipeDetailProps) {
  const byline = isOwner ? "Your recipe" : creatorName;

  return (
    <article className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          {isPublic !== undefined && (
            <span
              className={`self-start flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isPublic
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isPublic ? (
                <><Globe className="w-3 h-3" /> Public</>
              ) : (
                <><Lock className="w-3 h-3" /> Private</>
              )}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-foreground">
            {title}
          </h1>
          {byline && (
            <p className={`text-sm ${isOwner ? "text-accent/70" : "text-muted-foreground"}`}>
              {byline}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {description && (
        <p className="text-muted-foreground text-lg leading-relaxed">
          {description}
        </p>
      )}

      {ingredients && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-xl text-foreground">Ingredients</h2>
          <pre className="whitespace-pre-wrap font-sans text-sm bg-muted rounded-lg p-4 leading-relaxed">
            {ingredients}
          </pre>
        </section>
      )}

      {instructions && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-xl text-foreground">Instructions</h2>
          <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed bg-muted rounded-lg p-4">
            {instructions}
          </div>
        </section>
      )}
    </article>
  );
}
