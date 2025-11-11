"use client";

import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import ThemeToggle from "@/components/ui/theme-toggle";
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

export default function Home() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answerById, setAnswerById] = useState<Record<number, string>>({});
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // dynamic imports for client-side only; basic version loads both
      const [{ default: qs }, { default: withAnswers }]: [
        { default: Question[] },
        { default: AnswerItem[] },
      ] = await Promise.all([
        import("../../data/fe-questions.json"),
        import("../../data/fe-questions-with-answers.json"),
      ]);

      if (!mounted) return;

      // keep questions list (id, title, meta)
      setQuestions(
        qs
          .map((q) => ({
            id: q.id,
            title: q.title,
            permalink: q.permalink,
            tags: q.tags,
            likes: q.likes,
            createdAt: q.createdAt,
            difficulty: q.difficulty,
          }))
          // sort descending by id so newest first (matches file top ordering)
          .sort((a, b) => b.id - a.id),
      );

      // build id -> answer map (skip nulls)
      const map: Record<number, string> = {};
      for (const item of withAnswers) {
        if (item.answer) map[item.id] = item.answer;
      }
      setAnswerById(map);
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
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-12">
        <header className="mb-8 flex items-center justify-between">
          <div className="">
            <h1 className="text-2xl font-semibold tracking-tight">
              Frontend Interview Prep
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Tap a question to view the answer.
            </p>
          </div>
          <ThemeToggle />
        </header>

        {!questions ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-6" />
          </div>
        ) : (
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
                    {/* <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary/80" /> */}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="mt-0.5 line-clamp-2 text-base">
                        {(() => {
                          // Match a leading number (with optional dot/space/paren after)
                          const match = q.title.match(/^(\d+(\.|[)]|[ ]?))\s*/);
                          if (match) {
                            const questionNubmer = match[0];
                            const question = q.title.slice(
                              questionNubmer.length,
                            );
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
        )}
      </main>
      <AnswerDrawer open={open} onOpenChange={setOpen} active={active} />
    </div>
  );
}
