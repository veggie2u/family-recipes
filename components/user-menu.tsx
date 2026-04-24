"use client";

import { BookMarked, BookOpen, Bookmark, Laptop, Moon, Sun, UserCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ICON_SIZE = 16;

const THEMES = ["light", "dark", "system"] as const;
type Theme = (typeof THEMES)[number];

const THEME_ICONS: Record<Theme, React.ReactNode> = {
  light: <Sun size={ICON_SIZE} className="text-muted-foreground" />,
  dark: <Moon size={ICON_SIZE} className="text-muted-foreground" />,
  system: <Laptop size={ICON_SIZE} className="text-muted-foreground" />,
};

const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

interface UserMenuProps {
  displayName: string;
  inviteCount?: number;
}

export function UserMenu({ displayName, inviteCount = 0 }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const current = (theme as Theme) ?? "system";
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    setTheme(next);
  };

  const currentTheme = (theme as Theme) ?? "system";

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="User menu" className="relative">
          <UserCircle className="h-5 w-5" />
          {inviteCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-bold leading-none">
              {inviteCount > 9 ? "9+" : inviteCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-medium">{displayName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground uppercase tracking-wide px-2 pt-1">
          My stuff
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => router.push("/recipes")} className="flex gap-2">
          <BookOpen size={ICON_SIZE} className="text-muted-foreground" />
          My Recipes
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/cookbooks")} className="flex gap-2">
          <BookMarked size={ICON_SIZE} className="text-muted-foreground" />
          My Cookbooks
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/families")} className="flex gap-2">
          <Users size={ICON_SIZE} className="text-muted-foreground" />
          My Families
          {inviteCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white font-bold">
              {inviteCount > 9 ? "9+" : inviteCount}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/bookmarks")} className="flex gap-2">
          <Bookmark size={ICON_SIZE} className="text-muted-foreground" />
          Bookmarks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {mounted && (
          <DropdownMenuItem onSelect={cycleTheme} className="flex gap-2">
            {THEME_ICONS[currentTheme]}
            <span>{THEME_LABELS[currentTheme]}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} className="text-destructive focus:text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
