import questionsData from "@/data/fe-questions.json";
import { QuestionsClient } from "./questions-client";
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

export default function Home() {
  // Process questions on server
  const questions: Question[] = questionsData
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
    .sort((a, b) => a.id - b.id);

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

        <QuestionsClient questions={questions} />
      </main>
    </div>
  );
}
