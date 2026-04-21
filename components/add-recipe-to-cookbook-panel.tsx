"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { addRecipeToCookbook } from "@/app/dashboard/cookbooks/actions";

interface Props {
  cookbookId: string;
  availableRecipes: { id: string; title: string; description: string | null }[];
}

export default function AddRecipeToCookbookPanel({ cookbookId, availableRecipes }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = availableRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (recipeId: string) => {
    setPendingId(recipeId);
    startTransition(async () => {
      await addRecipeToCookbook(cookbookId, recipeId);
      setOpen(false);
      setSearch("");
      setPendingId(null);
    });
  };

  const isEmpty = availableRecipes.length === 0;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isEmpty}
          onClick={() => !isEmpty && setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ＋ Add Recipe
        </button>
        {isEmpty && (
          <span className="text-sm text-muted-foreground">
            (all your recipes are already in this cookbook)
          </span>
        )}
      </div>

      {open && (
        <div className="border rounded-lg bg-card p-4 w-full max-w-md">
          <Input
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="overflow-y-auto max-h-64 mt-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-2">No recipes found.</p>
            ) : (
              filtered.map((recipe) => {
                const loading = isPending && pendingId === recipe.id;
                return (
                  <div
                    key={recipe.id}
                    onClick={() => !isPending && handleAdd(recipe.id)}
                    className="flex flex-col px-3 py-2 rounded hover:bg-muted cursor-pointer opacity-100 aria-disabled:opacity-50"
                    aria-disabled={isPending}
                  >
                    <span className="font-medium text-sm">
                      {loading ? "Adding…" : recipe.title}
                    </span>
                    {recipe.description && (
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {recipe.description}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
