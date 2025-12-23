"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ui/theme-toggle";
import { QuestionFilters } from "@/components/question-filters";
import { Questions } from "./questions";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("search") || "";
  });

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

  // Filter questions based on difficulties, tags, and searchQuery
  const filteredQuestions = useMemo(() => {
    let base: Question[] = questions;
    if (filters?.difficulties?.length) {
      base = base.filter((item) =>
        filters.difficulties.includes(item.difficulty),
      );
    }
    if (filters?.tags?.length) {
      base = base.filter((item) => filters.tags.includes(item.tags));
    }
    // Search filter - matches title (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      base = base.filter((item) => item.title.toLowerCase().includes(query));
    }
    return base;
  }, [filters, questions, searchQuery]);

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
            Showing <b>{filteredQuestions.length}</b> questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/quiz">
              <BookOpen className="mr-2 size-4" />
              Quiz Mode
            </Link>
          </Button>
          <ThemeToggle />
        </div>
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

      <Questions questions={filteredQuestions} />
    </div>
  );
}
