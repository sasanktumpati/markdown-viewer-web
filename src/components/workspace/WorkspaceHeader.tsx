"use client";

import type { ViewMode } from "@/store/useWorkspaceStore";

type WorkspaceHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: "split", label: "Split" },
  { value: "editor", label: "Editor" },
  { value: "preview", label: "Preview" },
];

export function WorkspaceHeader({
  viewMode,
  onViewModeChange,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <h1 className="text-sm font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
        Markdown Workspace
      </h1>
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
    </header>
  );
}
