"use client";

import type { ViewMode } from "@/store/useWorkspaceStore";

type WorkspaceHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
};

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: "split", label: "Split" },
  { value: "editor", label: "Editor" },
  { value: "preview", label: "Preview" },
];

export function WorkspaceHeader({
  viewMode,
  onViewModeChange,
  isDarkMode,
  onDarkModeToggle,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
          Markdown Workspace
        </h1>
        <a
          href="https://github.com/sasanktumpati/markdown-viewer-web"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
          title="View source on GitHub"
          aria-label="View source on GitHub"
        >
          <GitHubIcon />
        </a>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDarkModeToggle}
          className="group relative h-9 w-9 rounded-[var(--radius-lg)] border border-border bg-background text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-all duration-300">
            {isDarkMode ? <MoonIcon /> : <SunIcon />}
          </span>
        </button>
        <nav className="flex w-full overflow-hidden rounded-[var(--radius-lg)] border border-border sm:w-auto">
          {VIEW_OPTIONS.map((mode) => {
            const isActive = mode.value === viewMode;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => onViewModeChange(mode.value)}
                className={`flex-1 px-3 py-2 text-sm transition-colors sm:flex-none ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
