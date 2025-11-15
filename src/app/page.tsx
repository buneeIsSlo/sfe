import { Suspense } from "react";
import questionsData from "@/data/fe-questions.json";
import { QuestionsPageClient } from "./questions-client-wrapper";
import { Spinner } from "@/components/ui/spinner";
import { GridPattern } from "../components/grid-pattern";
import { cn } from "@/lib/utils";

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
    .sort((a, b) => a.id - b.id);

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex h-full min-h-screen w-full max-w-3xl flex-col px-4 py-12">
          <Spinner className="mx-auto" />
        </div>
      }
    >
      <GridPattern
        width={150}
        height={150}
        x={-1}
        y={-1}
        strokeDasharray={"8 4"}
        className={cn(
          "mask-[radial-gradient(800px_circle_at_center_bottom,white,transparent)]",
          "fixed inset-0",
        )}
      />
      <QuestionsPageClient questions={questions} />
    </Suspense>
  );
}
