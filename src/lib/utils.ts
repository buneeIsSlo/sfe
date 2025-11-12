import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TAG_COLORS: Record<string, { className?: string }> = {
  // Core Technologies
  JavaScript: {
    className:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  TypeScript: {
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  HTML: {
    className:
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  },
  CSS: {
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },

  // Frameworks & Libraries
  React: {
    className:
      "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  },
  Vue: {
    className:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  Angular: {
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },

  // Tools & Package Managers
  NPM: {
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  Webpack: {
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  Vite: {
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },

  // Network & Protocols
  Network: {
    className:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  HTTP: {
    className:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  network: {
    className:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },

  // System & Architecture
  SystemDesign: {
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  Architecture: {
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },

  // Performance & Optimization
  performance: {
    className:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  Performance: {
    className:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },

  // Security & Auth
  Auth: {
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  Security: {
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },

  // Mobile & Platforms
  Mobile: {
    className:
      "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  },

  // Behavioral & Soft Skills
  Behavioral: {
    className:
      "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  },
  Behavior: {
    className:
      "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  },

  // General & Misc
  General: {
    className:
      "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  },
  Fun: {
    className:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },

  // Default fallback
  default: {
    className:
      "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  },
};

export function getTagColor(tag: string): { className?: string } {
  return TAG_COLORS[tag] || TAG_COLORS.default;
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-green-500",
  Medium: "text-yellow-500",
  Hard: "text-destructive",
};

export function getDifficultyColors(difficulty: string): string {
  return DIFFICULTY_COLORS[difficulty];
}
