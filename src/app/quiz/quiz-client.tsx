"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnswerDrawer } from "@/components/answer-drawer";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDifficultyColors, getTagColor } from "@/lib/utils";
import ThemeToggle from "@/components/ui/theme-toggle";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Home,
  History,
} from "lucide-react";

type Question = {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  createdAt: number;
  difficulty: string;
  answer: string | null;
};

interface QuizClientProps {
  questions: Question[];
}

const SEEN_QUESTIONS_KEY = "quiz-seen-questions";
const HISTORY_KEY = "quiz-history";

export function QuizClient({ questions }: QuizClientProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [seenQuestionIds, setSeenQuestionIds] = useState<Set<number>>(
    new Set(),
  );
  const [questionHistory, setQuestionHistory] = useState<number[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from storage on mount
  useEffect(() => {
    try {
      // Load seen questions from localStorage
      const storedSeen = localStorage.getItem(SEEN_QUESTIONS_KEY);
      if (storedSeen) {
        setSeenQuestionIds(new Set(JSON.parse(storedSeen)));
      }

      // Load history from sessionStorage
      const storedHistory = sessionStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        const history = JSON.parse(storedHistory);
        setQuestionHistory(history);

        // If there's history, resume from last question
        if (history.length > 0) {
          const lastIndex = history.length - 1;
          setCurrentHistoryIndex(lastIndex);
          const lastQuestionId = history[lastIndex];
          const lastQuestion = questions.find((q) => q.id === lastQuestionId);
          if (lastQuestion) {
            setCurrentQuestion(lastQuestion);
          }
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading quiz state:", error);
      setIsInitialized(true);
    }
  }, [questions]);

  // Get random unseen question
  const getRandomUnseenQuestion = (): Question | null => {
    const unseenQuestions = questions.filter((q) => !seenQuestionIds.has(q.id));

    if (unseenQuestions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * unseenQuestions.length);
    return unseenQuestions[randomIndex];
  };

  // Initialize with random question after state is loaded
  useEffect(() => {
    if (isInitialized && !currentQuestion) {
      const randomQuestion = getRandomUnseenQuestion();
      if (randomQuestion) {
        setCurrentQuestion(randomQuestion);
        setQuestionHistory([randomQuestion.id]);
        setCurrentHistoryIndex(0);
        setSeenQuestionIds(new Set([randomQuestion.id]));
      }
    }
  }, [isInitialized]);

  // Save seen questions to localStorage
  useEffect(() => {
    if (isInitialized && seenQuestionIds.size > 0) {
      try {
        localStorage.setItem(
          SEEN_QUESTIONS_KEY,
          JSON.stringify(Array.from(seenQuestionIds)),
        );
      } catch (error) {
        console.error("Error saving seen questions:", error);
      }
    }
  }, [seenQuestionIds, isInitialized]);

  // Save history to sessionStorage
  useEffect(() => {
    if (isInitialized && questionHistory.length > 0) {
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(questionHistory));
      } catch (error) {
        console.error("Error saving history:", error);
      }
    }
  }, [questionHistory, isInitialized]);

  const handleNext = () => {
    // Check if we're at the end of history
    const isAtEndOfHistory = currentHistoryIndex === questionHistory.length - 1;

    if (isAtEndOfHistory) {
      // Get a new random unseen question
      const nextQuestion = getRandomUnseenQuestion();

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        const newHistory = [...questionHistory, nextQuestion.id];
        setQuestionHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
        setSeenQuestionIds(new Set([...seenQuestionIds, nextQuestion.id]));
        setIsDrawerOpen(false);
      }
    } else {
      // Navigate forward in history
      const nextIndex = currentHistoryIndex + 1;
      const nextQuestionId = questionHistory[nextIndex];
      const nextQuestion = questions.find((q) => q.id === nextQuestionId);

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setCurrentHistoryIndex(nextIndex);
        setIsDrawerOpen(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentHistoryIndex <= 0) return;

    const previousIndex = currentHistoryIndex - 1;
    const previousQuestionId = questionHistory[previousIndex];
    const previousQuestion = questions.find((q) => q.id === previousQuestionId);

    if (previousQuestion) {
      setCurrentQuestion(previousQuestion);
      setCurrentHistoryIndex(previousIndex);
      setIsDrawerOpen(false);
    }
  };

  const handleRevealAnswer = () => {
    setIsDrawerOpen(true);
  };

  const handleSelectFromHistory = (index: number) => {
    const questionId = questionHistory[index];
    const question = questions.find((q) => q.id === questionId);

    if (question) {
      setCurrentQuestion(question);
      setCurrentHistoryIndex(index);
      setIsDrawerOpen(false);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(SEEN_QUESTIONS_KEY);
      sessionStorage.removeItem(HISTORY_KEY);
      setSeenQuestionIds(new Set());
      setQuestionHistory([]);

      // Get a new random question
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomQuestion);
      setQuestionHistory([randomQuestion.id]);
      setCurrentHistoryIndex(0);
      setSeenQuestionIds(new Set([randomQuestion.id]));
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error resetting quiz:", error);
    }
  };

  const allQuestionsSeen = seenQuestionIds.size === questions.length;
  const canGoPrevious = currentHistoryIndex > 0;
  const canGoNext =
    currentHistoryIndex < questionHistory.length - 1 || !allQuestionsSeen;
  const activeQuestionForDrawer = currentQuestion
    ? { ...currentQuestion, answer: currentQuestion.answer || null }
    : null;

  // Get history questions for popover
  const historyQuestions = questionHistory
    .map((id, index) => {
      const question = questions.find((q) => q.id === id);
      return question ? { ...question, historyIndex: index } : null;
    })
    .filter((q) => q !== null);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="relative z-10 mx-auto w-full max-w-3xl pt-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              Home
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {allQuestionsSeen && (
              <Badge
                variant="outline"
                className="border-green-500 text-green-500"
              >
                Complete
              </Badge>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="mr-2 size-4" />
                  History ({questionHistory.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="border-border border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">Quiz History</h3>
                  <p className="text-muted-foreground text-xs">
                    Questions viewed this session
                  </p>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {historyQuestions.length > 0 ? (
                    <div className="space-y-1 p-2">
                      {historyQuestions.reverse().map((q) => {
                        if (!q) return null;
                        const isActive = q.historyIndex === currentHistoryIndex;
                        const truncatedTitle =
                          q.title.length > 60
                            ? q.title.substring(0, 60) + "..."
                            : q.title;

                        return (
                          <button
                            key={q.historyIndex}
                            onClick={() =>
                              handleSelectFromHistory(q.historyIndex)
                            }
                            className={`hover:bg-accent w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                              isActive ? "bg-accent" : ""
                            }`}
                          >
                            <span
                              className={`${isActive ? "font-medium" : ""}`}
                            >
                              {truncatedTitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                      No history yet
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        {currentQuestion ? (
          <Card className="relative flex h-[600px] w-full max-w-3xl flex-col overflow-hidden shadow-xl">
            <Button
              variant="secondary"
              size="icon"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="absolute top-1/2 left-4 z-10 size-10 -translate-y-1/2 rounded-full"
              aria-label="Previous question"
            >
              <ChevronLeft className="size-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleNext}
              disabled={!canGoNext}
              className="absolute top-1/2 right-4 z-10 size-10 -translate-y-1/2 rounded-full"
              aria-label="Next question"
            >
              <ChevronRight className="size-6" />
            </Button>

            {/* Question Content */}
            <div className="flex flex-1 flex-col items-center justify-center px-16 py-12 text-center">
              <div className="space-y-6">
                <h2 className="text-3xl leading-tight font-bold select-text md:text-4xl lg:text-5xl">
                  {(() => {
                    // Match a leading number (with optional dot/space/paren after)
                    const match =
                      currentQuestion.title.match(/^(\d+(\.|\)| ?))\s*/);
                    if (match) {
                      const questionNumber = match[0];
                      const question = currentQuestion.title.slice(
                        questionNumber.length,
                      );
                      return (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-primary/80 font-mono text-2xl md:text-3xl">
                            {questionNumber.trim()}
                          </span>
                          <span>{question}</span>
                        </div>
                      );
                    }
                    return currentQuestion.title;
                  })()}
                </h2>

                {/* Question metadata */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge
                    className={getTagColor(currentQuestion.tags).className}
                  >
                    {currentQuestion.tags}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span
                    className={`text-sm font-medium ${getDifficultyColors(currentQuestion.difficulty)}`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-border flex items-center justify-center gap-4 border-t px-6 py-6">
              <Button
                size="lg"
                onClick={handleRevealAnswer}
                className="w-full py-8 text-lg font-semibold"
              >
                <Eye className="mr-2 size-5" />
                Reveal Answer
              </Button>

              {allQuestionsSeen && (
                <Button variant="outline" size="lg" onClick={handleReset}>
                  <RotateCcw className="mr-2 size-4" />
                  Reset Progress
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="flex h-[600px] w-full max-w-4xl flex-col items-center justify-center">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">No questions available</p>
              <Button onClick={handleReset}>Start Quiz</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Answer Drawer */}
      <AnswerDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        active={activeQuestionForDrawer}
      />
    </div>
  );
}
