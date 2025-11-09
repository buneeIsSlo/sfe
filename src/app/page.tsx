"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { RenderMarkdown } from "@/components/ui/render-markdown";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import ThemeToggle from "@/components/ui/theme-toggle";

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
        { default: AnswerItem[] }
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
          .sort((a, b) => b.id - a.id)
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
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-12">
        <header className="mb-8 flex justify-between items-center">
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
          <ul className="divide-y divide-border rounded-lg border">
            {questions.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  className="w-full cursor-pointer text-left transition-colors hover:bg-accent/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/60"
                  onClick={() => {
                    setActiveId(q.id);
                    setOpen(true);
                  }}
                >
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary/80" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-muted-foreground">
                          #{q.id} • {q.tags} • {q.difficulty}
                        </p>
                        <h2 className="mt-0.5 line-clamp-2 text-base font-medium">
                          {q.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="rounded-t-2xl max-w-4xl mx-auto data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=top]:max-h-[90vh]">
          <div className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="p-0 text-left shrink-0">
              {active ? (
                <div className="w-full">
                  <div className="px-4 pb-3 pt-4">
                    <DrawerTitle className="text-lg font-semibold text-left select-text">
                      {active.title}
                    </DrawerTitle>
                    <p className="text-muted-foreground mt-1 text-xs text-left select-text">
                      #{active.id} • {active.tags} • {active.difficulty}
                    </p>
                  </div>
                  <Separator />
                </div>
              ) : (
                <div className="flex items-center justify-center p-6">
                  <Spinner className="size-6" />
                </div>
              )}
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {active && (
                <div className="px-4 py-4 text-sm leading-7 text-left select-text">
                  {active.answer ? (
                    <RenderMarkdown>{active.answer}</RenderMarkdown>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No answer available.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
