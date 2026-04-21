"use client";

import { useTransition } from "react";
import { BookPlus } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addRecipeToCookbook } from "@/app/dashboard/cookbooks/actions";

interface Props {
  recipeId: string;
  cookbooks: { id: string; name: string }[];
}

export default function AddToCookbookButton({ recipeId, cookbooks }: Props) {
  const [isPending, startTransition] = useTransition();

  if (cookbooks.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <BookPlus size={16} />
          Add to cookbook
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {cookbooks.map((cookbook) => (
          <DropdownMenuItem
            key={cookbook.id}
            onSelect={() =>
              startTransition(async () => {
                await addRecipeToCookbook(cookbook.id, recipeId);
                toast.success(`Added to "${cookbook.name}"`);
              })
            }
          >
            {cookbook.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
