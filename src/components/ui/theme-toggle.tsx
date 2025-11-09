"use client";

import { useId } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const id = useId();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <legend className="sr-only">Dark mode toggle checkbox</legend>
      <div className="flex flex-col justify-center">
        <input
          type="checkbox"
          name={id}
          id={id}
          className="peer sr-only"
          checked={theme === "dark"}
          onChange={() =>
            theme === "dark" ? setTheme("light") : setTheme("dark")
          }
        />
        <label
          className="group relative inline-flex size-9 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-xs transition-[color,box-shadow] outline-none peer-focus-visible:border-ring peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 hover:bg-accent hover:text-accent-foreground"
          htmlFor={id}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {/* Note: After dark mode implementation, rely on dark: prefix rather than group-peer-checked: */}
          <MoonIcon
            size={16}
            className="shrink-0 scale-0 opacity-0 transition-all group-peer-checked:scale-100 group-peer-checked:opacity-100"
            aria-hidden="true"
          />
          <SunIcon
            size={16}
            className="absolute shrink-0 scale-100 opacity-100 transition-all group-peer-checked:scale-0 group-peer-checked:opacity-0"
            aria-hidden="true"
          />
        </label>
      </div>
    </div>
  );
}
