"use client";

import { useEffect, useState, useCallback, useReducer } from "react";
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

interface QuizState {
  currentQuestion: Question | null;
  seenQuestionIds: Set<number>;
  questionHistory: number[];
  currentHistoryIndex: number;
  isInitialized: boolean;
}

type QuizAction =
  | { type: "INITIALIZE"; payload: Omit<QuizState, "isInitialized"> }
  | { type: "SET_QUESTION"; payload: { question: Question; historyIndex: number } }
  | { type: "NEXT_QUESTION"; payload: { question: Question; newHistory: number[]; newHistoryIndex: number; newSeenIds: Set<number> } }
  | { type: "RESET"; payload: { question: Question } };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "INITIALIZE":
      return { ...action.payload, isInitialized: true };
    case "SET_QUESTION":
      return {
        ...state,
        currentQuestion: action.payload.question,
        currentHistoryIndex: action.payload.historyIndex,
      };
    case "NEXT_QUESTION":
      return {
        ...state,
        currentQuestion: action.payload.question,
        questionHistory: action.payload.newHistory,
        currentHistoryIndex: action.payload.newHistoryIndex,
        seenQuestionIds: action.payload.newSeenIds,
      };
    case "RESET":
      return {
        ...state,
        seenQuestionIds: new Set([action.payload.question.id]),
        questionHistory: [action.payload.question.id],
        currentQuestion: action.payload.question,
        currentHistoryIndex: 0,
      };
    default:
      return state;
  }
}

// Helper to load initial state from storage
function loadInitialState(questions: Question[]): Omit<QuizState, "isInitialized"> {
  try {
    const storedSeen = localStorage.getItem(SEEN_QUESTIONS_KEY);
    const storedHistory = sessionStorage.getItem(HISTORY_KEY);

    const seenIds = storedSeen ? new Set<number>(JSON.parse(storedSeen)) : new Set<number>();
    const history: number[] = storedHistory ? JSON.parse(storedHistory) : [];

    let currentQ: Question | null = null;
    let historyIndex = 0;

    if (history.length > 0) {
      const lastIndex = history.length - 1;
      historyIndex = lastIndex;
      const lastQuestionId = history[lastIndex];
      const lastQuestion = questions.find((q) => q.id === lastQuestionId);
      if (lastQuestion) {
        currentQ = lastQuestion;
      }
    }

    // If we have stored state, return it
    if (currentQ) {
      return {
        currentQuestion: currentQ,
        seenQuestionIds: seenIds,
        questionHistory: history,
        currentHistoryIndex: historyIndex,
      };
    }

    // Otherwise, start with a random question
    const unseenQuestions = questions.filter((q) => !seenIds.has(q.id));
    if (unseenQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * unseenQuestions.length);
      const randomQuestion = unseenQuestions[randomIndex];
      return {
        currentQuestion: randomQuestion,
        seenQuestionIds: new Set([randomQuestion.id]),
        questionHistory: [randomQuestion.id],
        currentHistoryIndex: 0,
      };
    }

    return {
      currentQuestion: null,
      seenQuestionIds: new Set(),
      questionHistory: [],
      currentHistoryIndex: 0,
    };
  } catch {
    return {
      currentQuestion: null,
      seenQuestionIds: new Set(),
      questionHistory: [],
      currentHistoryIndex: 0,
    };
  }
}

const initialState: QuizState = {
  currentQuestion: null,
  seenQuestionIds: new Set(),
  questionHistory: [],
  currentHistoryIndex: 0,
  isInitialized: false,
};

export function QuizClient({ questions }: QuizClientProps) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const { currentQuestion, seenQuestionIds, questionHistory, currentHistoryIndex, isInitialized } = state;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get random unseen question
  const getRandomUnseenQuestion = useCallback((excludeIds: Set<number>): Question | null => {
    const unseenQuestions = questions.filter((q) => !excludeIds.has(q.id));

    if (unseenQuestions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * unseenQuestions.length);
    return unseenQuestions[randomIndex];
  }, [questions]);

  // Load state from storage on mount
  useEffect(() => {
    const loadedState = loadInitialState(questions);
    dispatch({ type: "INITIALIZE", payload: loadedState });
  }, [questions]);

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
      const nextQuestion = getRandomUnseenQuestion(seenQuestionIds);

      if (nextQuestion) {
        const newHistory = [...questionHistory, nextQuestion.id];
        dispatch({
          type: "NEXT_QUESTION",
          payload: {
            question: nextQuestion,
            newHistory,
            newHistoryIndex: newHistory.length - 1,
            newSeenIds: new Set([...seenQuestionIds, nextQuestion.id]),
          },
        });
        setIsDrawerOpen(false);
      }
    } else {
      // Navigate forward in history
      const nextIndex = currentHistoryIndex + 1;
      const nextQuestionId = questionHistory[nextIndex];
      const nextQuestion = questions.find((q) => q.id === nextQuestionId);

      if (nextQuestion) {
        dispatch({
          type: "SET_QUESTION",
          payload: { question: nextQuestion, historyIndex: nextIndex },
        });
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
      dispatch({
        type: "SET_QUESTION",
        payload: { question: previousQuestion, historyIndex: previousIndex },
      });
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
      dispatch({
        type: "SET_QUESTION",
        payload: { question, historyIndex: index },
      });
      setIsDrawerOpen(false);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(SEEN_QUESTIONS_KEY);
      sessionStorage.removeItem(HISTORY_KEY);

      // Get a new random question
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      dispatch({ type: "RESET", payload: { question: randomQuestion } });
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
