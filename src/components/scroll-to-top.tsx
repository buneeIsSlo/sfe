"use client";

import * as React from "react";
import {
  useContext,
  createContext,
  RefObject,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";

interface ScrollTopContextValue {
  scrollTop: number;
  isAtTop: boolean;
  scrollToTop: (options?: ScrollToOptions) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

const ScrollTopContext = createContext<ScrollTopContextValue | null>(null);

export function useScrollToTopContext() {
  const context = useContext(ScrollTopContext);

  if (!context) {
    throw new Error(
      "useScrollToTopContext must be used within a ScrollToTop component",
    );
  }

  return context;
}

interface ScrollToTopProps extends React.HTMLAttributes<HTMLDivElement> {
  threshold?: number;
  children: React.ReactNode;
}

export function ScrollToTop({
  className,
  threshold = 200,
  children,
  ...props
}: ScrollToTopProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    setScrollTop(scrollRef.current.scrollTop);
  }, []);

  const scrollToTop = useCallback((options?: ScrollToOptions) => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth", ...options });
  }, []);

  const isAtTop = scrollTop < threshold;

  const value = useMemo(
    () => ({
      scrollTop,
      scrollToTop,
      isAtTop,
      scrollRef,
    }),
    [scrollTop, isAtTop, scrollToTop],
  );

  return (
    <ScrollTopContext.Provider value={value}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn("overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    </ScrollTopContext.Provider>
  );
}
