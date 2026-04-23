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
import { removeCookbookFromFamily } from "@/app/families/actions";

interface Props {
  familyId: string;
  cookbookId: string;
}

export function RemoveCookbookFromFamilyButton({ familyId, cookbookId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      await removeCookbookFromFamily(familyId, cookbookId);
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
          <DialogTitle>Remove cookbook?</DialogTitle>
          <DialogDescription>
            This will remove the cookbook from this family. The cookbook itself
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
