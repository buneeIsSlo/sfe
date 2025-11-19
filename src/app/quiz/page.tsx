import type { Metadata } from "next";
import { QuizClient } from "./quiz-client";
import questionsWithAnswers from "@/data/fe-questions-with-answers.json";
import { GridPattern } from "@/components/grid-pattern";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quiz Mode | sfe.dev",
  description: "Test your frontend knowledge with random interview questions",
};

export default function QuizPage() {
  return (
    <main className="relative min-h-screen">
      <GridPattern
        width={150}
        height={150}
        x={-1}
        y={-1}
        strokeDasharray={"8 4"}
        className={cn(
          "mask-[radial-gradient(800px_circle_at_center_bottom,white,transparent)]",
          "fixed inset-0"
        )}
      />
      <QuizClient questions={questionsWithAnswers} />
    </main>
  );
}
