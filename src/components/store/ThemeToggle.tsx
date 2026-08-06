"use client";

import { useTheme } from "@/lib/theme";

function EyeOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" />
      <path d="M9.4 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.1 4.1" />
      <path d="M6.1 6.1A17.5 17.5 0 0 0 2 12s3.5 7 10 7a10.3 10.3 0 0 0 4.2-.9" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mood" : "Switch to dark mood"}
      className="inline-flex min-h-9 items-center gap-1.5 border border-champagne bg-champagne px-2.5 py-1.5 text-[var(--on-accent)] shadow-sm transition hover:bg-champagne-deep sm:gap-2 sm:px-3"
    >
      {isDark ? (
        <EyeClosedIcon className="h-4 w-4 shrink-0" />
      ) : (
        <EyeOpenIcon className="h-4 w-4 shrink-0" />
      )}
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em]">
        {isDark ? "Dark" : "Light"}
      </span>
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em]">
        Mood
      </span>
    </button>
  );
}
