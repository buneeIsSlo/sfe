"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/theme-toggle";
import { QuestionFilters } from "@/components/question-filters";
import { Questions } from "./questions";

type Question = {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  createdAt: number;
  difficulty: string;
};

interface QuestionsPageClientProps {
  questions: Question[];
}

export function QuestionsPageClient({ questions }: QuestionsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allDifficulties = ["Easy", "Medium", "Hard"];

  const allTags = useMemo(() => {
    const uniqueTags = new Set<string>();
    for (const q of questions) if (q.tags) uniqueTags.add(q.tags);
    return Array.from(uniqueTags).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  // Initialize state from URL params
  const [filters, setFilters] = useState<{
    difficulties: string[];
    tags: string[];
  }>(() => {
    const difficultyParam = searchParams.get("difficulty");
    const tagParam = searchParams.get("tags");
    return {
      difficulties: difficultyParam
        ? difficultyParam.split(",").filter((d) => allDifficulties.includes(d))
        : allDifficulties,
      tags: tagParam
        ? tagParam.split(",").filter((t) => allTags.includes(t))
        : [],
    };
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("search") || "";
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (
      filters.difficulties.length > 0 &&
      filters.difficulties.length < allDifficulties.length
    ) {
      params.set("difficulty", filters.difficulties.join(","));
    }

    if (filters.tags.length > 0) {
      params.set("tags", filters.tags.join(","));
    }

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, searchQuery, router, allDifficulties.length]);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-12">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Frontend Interview Prep
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {`Showing ${questions.length} questions`}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <QuestionFilters
        difficulties={allDifficulties}
        tags={allTags}
        value={filters}
        onChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        className="mb-6"
      />

      <Questions
        questions={questions}
        filters={filters}
        searchQuery={searchQuery}
      />
    </div>
  );
}
