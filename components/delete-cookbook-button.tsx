"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCookbook } from "@/app/cookbooks/actions";

export function DeleteCookbookButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    await deleteCookbook(id);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete cookbook?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The cookbook will be permanently
            deleted.
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
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Delete cookbook"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
