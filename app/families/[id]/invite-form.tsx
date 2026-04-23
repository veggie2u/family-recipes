"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { inviteToFamily, searchUsers } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InviteFormProps {
  familyId: string;
}

export function InviteForm({ familyId }: InviteFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string | null }>>([]);
  const [selected, setSelected] = useState<{ id: string; name: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) return; // Don't search if user already selected
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const r = await searchUsers(query, familyId);
        setResults(r);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, familyId, selected]);

  const handleSelect = (user: { id: string; name: string | null }) => {
    setSelected(user);
    setQuery(user.name ?? user.id);
    setResults([]);
    setError(null);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setError("Please select a user from the search results.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await inviteToFamily(familyId, selected.id);
        setSuccess(true);
        handleClear();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1.5 relative">
        <Label htmlFor="invite-search">Search by name</Label>
        <Input
          id="invite-search"
          type="text"
          placeholder="Start typing a name…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setError(null);
            setSuccess(false);
          }}
          disabled={isPending}
          autoComplete="off"
        />
        {/* Dropdown results */}
        {results.length > 0 && !selected && (
          <ul
            className={cn(
              "absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-border bg-popover shadow-md",
              "max-h-48 overflow-y-auto"
            )}
          >
            {results.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleSelect(user)}
                >
                  {user.name ?? "(no name)"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {isSearching && (
          <p className="text-xs text-muted-foreground mt-1">Searching…</p>
        )}
        {!isSearching && query.trim().length >= 2 && results.length === 0 && !selected && (
          <p className="text-xs text-muted-foreground mt-1">No users found.</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">Invitation sent!</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !selected}>
          {isPending ? "Sending…" : "Send Invitation"}
        </Button>
        {selected && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
