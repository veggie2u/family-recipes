"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteRecipe } from "@/app/recipes/actions";

interface DeleteRecipeButtonProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRecipeButton({ id, open, onOpenChange }: DeleteRecipeButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    await deleteRecipe(id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete recipe?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The recipe will be permanently
            deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="px-4 py-2 rounded border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Delete recipe"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
