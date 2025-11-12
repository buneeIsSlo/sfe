"use client";

import { useEffect, useMemo, useState } from "react";
import { AnswerDrawer } from "@/components/answer-drawer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Question = {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  createdAt: number;
  difficulty: string;
};

type AnswerItem = Question & {
  answer: string | null;
};

interface QuestionsClientProps {
  questions: Question[];
}

export function QuestionsClient({ questions }: QuestionsClientProps) {
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
        {questions.map((q) => (
          <Card
            key={q.id}
            className="hover:bg-accent/30 focus-visible:ring-ring/60 cursor-pointer focus:outline-none focus-visible:ring-1"
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
                  <CardDescription className="truncate">
                    {q.tags} • {q.difficulty}
                  </CardDescription>
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
