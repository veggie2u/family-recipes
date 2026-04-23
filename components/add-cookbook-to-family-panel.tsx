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
import { addCookbookToFamily, removeCookbookFromFamily } from "@/app/families/actions";

interface Props {
  familyId: string;
  allCookbooks: { id: string; name: string; description: string | null }[];
  initialSelectedIds: string[];
}

export default function AddCookbookToFamilyPanel({ familyId, allCookbooks, initialSelectedIds }: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelectedIds));
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const filtered = allCookbooks.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (cookbookId: string) => {
    if (pendingIds.has(cookbookId)) return;

    const isSelected = selectedIds.has(cookbookId);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(cookbookId);
      else next.add(cookbookId);
      return next;
    });

    setPendingIds((prev) => new Set(prev).add(cookbookId));

    startTransition(async () => {
      try {
        if (isSelected) {
          await removeCookbookFromFamily(familyId, cookbookId);
        } else {
          await addCookbookToFamily(familyId, cookbookId);
        }
      } catch {
        // Revert on failure
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (isSelected) next.add(cookbookId);
          else next.delete(cookbookId);
          return next;
        });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(cookbookId);
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
          Add Cookbook
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3 flex flex-col gap-2">
        <Input
          placeholder="Search cookbooks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="overflow-y-auto max-h-64">
          {allCookbooks.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-3">You have no cookbooks yet.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-3">No cookbooks found.</p>
          ) : (
            filtered.map((cookbook) => {
              const isSelected = selectedIds.has(cookbook.id);
              const isPending = pendingIds.has(cookbook.id);
              return (
                <div
                  key={cookbook.id}
                  onClick={() => handleToggle(cookbook.id)}
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
                    <span className="text-sm font-medium leading-snug truncate">{cookbook.name}</span>
                    {cookbook.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{cookbook.description}</span>
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
