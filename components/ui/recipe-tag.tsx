import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RecipeTagProps {
  tagText: string
  onClick?: (tagText: string) => void
  className?: string
}

export function RecipeTag({ tagText, onClick, className }: RecipeTagProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(tagText) }}
        className={cn(
          "inline-flex items-center rounded-full border border-secondary px-2.5 py-0.5 text-xs font-semibold transition-colors bg-transparent text-secondary hover:bg-secondary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring",
          className
        )}
      >
        {tagText}
      </button>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full text-secondary border-secondary dark:text-primary dark:border-primary dark:bg-primary/10",
        className
      )}
    >
      {tagText}
    </Badge>
  )
}
