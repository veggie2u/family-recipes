"use client";

import { useState, useTransition } from "react";
import { Check, BookPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addRecipeToCookbook, removeRecipeFromCookbook } from "@/app/dashboard/cookbooks/actions";

interface Props {
  cookbookId: string;
  allRecipes: { id: string; title: string; description: string | null }[];
  initialSelectedIds: string[];
}

export default function AddRecipeToCookbookPanel({ cookbookId, allRecipes, initialSelectedIds }: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelectedIds));
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const filtered = allRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (recipeId: string) => {
    if (pendingIds.has(recipeId)) return;

    const isSelected = selectedIds.has(recipeId);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });

    setPendingIds((prev) => new Set(prev).add(recipeId));

    startTransition(async () => {
      try {
        if (isSelected) {
          await removeRecipeFromCookbook(cookbookId, recipeId);
        } else {
          await addRecipeToCookbook(cookbookId, recipeId);
        }
      } catch {
        // Revert on failure
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (isSelected) next.add(recipeId);
          else next.delete(recipeId);
          return next;
        });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(recipeId);
          return next;
        });
      }
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <BookPlus size={16} />
          Add Recipe
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3 flex flex-col gap-2">
        <Input
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="overflow-y-auto max-h-64">
          {allRecipes.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-3">You have no recipes yet.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-3">No recipes found.</p>
          ) : (
            filtered.map((recipe) => {
              const isSelected = selectedIds.has(recipe.id);
              const isPending = pendingIds.has(recipe.id);
              return (
                <div
                  key={recipe.id}
                  onClick={() => handleToggle(recipe.id)}
                  className={cn(
                    "flex items-start gap-2 px-2 py-2 rounded cursor-pointer select-none transition-colors",
                    isPending ? "opacity-50 cursor-wait" : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  )}>
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium leading-snug truncate">{recipe.title}</span>
                    {recipe.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{recipe.description}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
