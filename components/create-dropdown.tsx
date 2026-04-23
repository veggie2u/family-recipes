"use client";

import { Plus, UtensilsCrossed, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const CREATE_ITEMS = [
  {
    label: "New Recipe",
    href: "/recipes/new",
    icon: UtensilsCrossed,
  },
  {
    label: "New Cookbook",
    href: "/cookbooks/new",
    icon: BookOpen,
  },
  {
    label: "New Family",
    href: "/families/new",
    icon: Users,
  },
];

export function CreateDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Create new</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CREATE_ITEMS.map(({ label, href, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href} className="flex items-center gap-2 cursor-pointer">
              <Icon className="w-4 h-4 text-muted-foreground" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
