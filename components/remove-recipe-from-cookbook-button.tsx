"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { removeRecipeFromCookbook } from "@/app/dashboard/cookbooks/actions";

interface Props {
  cookbookId: string;
  recipeId: string;
}

export function RemoveRecipeFromCookbookButton({ cookbookId, recipeId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      await removeRecipeFromCookbook(cookbookId, recipeId);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-destructive/40 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors">
          Remove
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove recipe?</DialogTitle>
          <DialogDescription>
            This will remove the recipe from this cookbook. The recipe itself
            will not be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="px-4 py-2 rounded border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="px-4 py-2 rounded bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Removing…" : "Remove"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
