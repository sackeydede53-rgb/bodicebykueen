"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="inline-flex items-center gap-2 border border-champagne/30 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-ivory/80 transition hover:border-champagne hover:text-champagne"
    >
      <span aria-hidden className="text-[0.85rem] leading-none">
        {isDark ? "○" : "●"}
      </span>
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
