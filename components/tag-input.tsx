"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagInputProps {
  allTags: string[];
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ allTags, value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalised = inputValue.trim().toLowerCase();

  const suggestions = normalised
    ? allTags.filter(
        (t) => t.includes(normalised) && !value.includes(t)
      )
    : [];

  const exactMatch = allTags.includes(normalised);
  const showAddOption = normalised.length > 0 && !exactMatch && !value.includes(normalised);

  const addTag = (tag: string) => {
    const lowered = tag.trim().toLowerCase();
    if (lowered && !value.includes(lowered)) {
      onChange([...value, lowered]);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (normalised) addTag(normalised);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dropdownItems = [
    ...suggestions,
    ...(showAddOption ? [`__add__:${normalised}`] : []),
  ];

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter…"
        autoComplete="off"
      />

      {isOpen && dropdownItems.length > 0 && (
        <ul className="absolute top-full mt-1 z-10 w-full rounded-md border border-border bg-popover shadow-md text-sm overflow-hidden">
          {dropdownItems.map((item) => {
            const isAdd = item.startsWith("__add__:");
            const label = isAdd ? item.slice(8) : item;
            return (
              <li key={item}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(label);
                  }}
                >
                  {isAdd ? (
                    <span>
                      Add <span className="font-medium">&ldquo;{label}&rdquo;</span>
                    </span>
                  ) : (
                    label
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
