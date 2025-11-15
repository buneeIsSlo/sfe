"use client";

import { useEffect, useMemo, useState } from "react";
import { AnswerDrawer } from "@/components/answer-drawer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColors, getTagColor } from "@/lib/utils";

type Question = {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  createdAt: number;
  difficulty: string;
};

interface QuestionsProps {
  questions: Question[];
  filters?: {
    difficulties: string[];
    tags: string[];
  };
  searchQuery?: string;
}

export function Questions({
  questions,
  filters,
  searchQuery = "",
}: QuestionsProps) {
  const [answerById, setAnswerById] = useState<Record<number, string>>({});
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Load answers in background (non-blocking)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Dynamic import for code splitting
        const { default: withAnswers } = await import(
          "@/data/fe-questions-with-answers.json"
        );

        if (!mounted) return;

        // Build id -> answer map (skip nulls)
        const map: Record<number, string> = {};
        for (const item of withAnswers) {
          if (item.answer) map[item.id] = item.answer;
        }
        setAnswerById(map);
      } catch (error) {
        console.error("Failed to load answers:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute filtered list
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

  const active = useMemo(() => {
    if (!questions || activeId == null) return null;
    const q = questions.find((x) => x.id === activeId);
    if (!q) return null;
    return {
      ...q,
      answer: answerById[activeId] ?? "",
    };
  }, [questions, activeId, answerById]);

  return (
    <>
      <div className="grid gap-4">
        {filteredQuestions.map((q) => (
          <Card
            key={q.id}
            className="hover:bg-accent/20 focus-visible:ring-ring/60 cursor-pointer backdrop-blur-sm focus:outline-none focus-visible:ring-1"
            onClick={() => {
              setActiveId(q.id);
              setOpen(true);
            }}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="mt-0.5 line-clamp-2 text-base">
                    {(() => {
                      // Match a leading number (with optional dot/space/paren after)
                      const match = q.title.match(/^(\d+(\.|[)]|[ ]?))\s*/);
                      if (match) {
                        const questionNubmer = match[0];
                        const question = q.title.slice(questionNubmer.length);
                        return (
                          <p className="flex items-baseline gap-2">
                            <span className="text-primary/80 font-mono">
                              {questionNubmer}
                            </span>
                            <span>{question}</span>
                          </p>
                        );
                      }
                      return q.title;
                    })()}
                  </CardTitle>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge className={getTagColor(q.tags).className}>
                      {q.tags}
                    </Badge>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span
                      className={`text-xs ${getDifficultyColors(q.difficulty)}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <AnswerDrawer open={open} onOpenChange={setOpen} active={active} />
    </>
  );
}
