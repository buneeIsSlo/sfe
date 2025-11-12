"use client";

import { useMemo } from "react";
import { FlameIcon, FunnelX, Search, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FiltersValue = {
  difficulties: string[];
  tags: string[];
};

interface QuestionFiltersProps {
  difficulties: string[];
  tags: string[];
  value: FiltersValue;
  onChange: (next: FiltersValue) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export function QuestionFilters({
  difficulties,
  tags,
  value,
  onChange,
  searchQuery,
  onSearchChange,
  className,
}: QuestionFiltersProps) {
  const selectedDifficulties = useMemo(
    () => new Set(value.difficulties),
    [value.difficulties],
  );
  const selectedTags = useMemo(() => new Set(value.tags), [value.tags]);

  function toggleDifficulty(d: string) {
    const next = new Set(selectedDifficulties);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    onChange({ ...value, difficulties: Array.from(next) });
  }

  function toggleTag(t: string) {
    const next = new Set(selectedTags);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    onChange({ ...value, tags: Array.from(next) });
  }

  function clearAll() {
    onChange({ difficulties, tags: [] });
    onSearchChange("");
  }

  const activeFilterCount = useMemo(() => {
    let count = 0;
    // Count selected difficulties (only if not all are selected)
    if (
      value.difficulties.length > 0 &&
      value.difficulties.length < difficulties.length
    ) {
      count += value.difficulties.length;
    }
    // Count selected tags
    if (value.tags.length > 0) {
      count += value.tags.length;
    }
    // Count search query
    if (searchQuery.trim()) {
      count += 1;
    }
    return count;
  }, [
    value.difficulties.length,
    value.tags.length,
    searchQuery,
    difficulties.length,
  ]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative min-w-[200px] flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search questions..."
          className="bg-background placeholder:text-muted-foreground/70 focus-visible:ring-ring/60 h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none focus-visible:ring-1"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="relative gap-2"
            title="Filter by Topics"
          >
            <TagIcon className="size-4" />
            {value.tags.length > 0 && (
              <Badge className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {value.tags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72">
          <div className="text-muted-foreground mb-2 text-xs font-medium">
            Select topics
          </div>
          <div className="grid max-h-64 gap-2 overflow-auto pr-1">
            {tags.map((t) => {
              const checked = selectedTags.has(t);
              return (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleTag(t)}
                  />
                  <span className="text-sm">{t}</span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="relative gap-2"
            title="Filter by Difficulty"
          >
            <FlameIcon className="size-4" />
            {value.difficulties.length > 0 &&
              value.difficulties.length < difficulties.length && (
                <Badge className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {value.difficulties.length}
                </Badge>
              )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-60">
          <div className="text-muted-foreground mb-2 text-xs font-medium">
            Select difficulties
          </div>
          <div className="grid gap-2">
            {difficulties.map((d) => {
              const checked = selectedDifficulties.has(d);
              return (
                <label
                  key={d}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleDifficulty(d)}
                  />
                  <span className="text-sm">{d}</span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant={"outline"}
        size={"icon"}
        title="Clear all Filters"
        disabled={activeFilterCount === 0}
        onClick={clearAll}
      >
        <FunnelX className="text-destructive size-4" />
      </Button>
    </div>
  );
}
