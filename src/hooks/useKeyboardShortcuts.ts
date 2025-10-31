import { useEffect } from "react";
import type { ViewMode } from "@/store/useWorkspaceStore";

type UseKeyboardShortcutsProps = {
  onViewModeChange: (mode: ViewMode) => void;
  currentViewMode: ViewMode;
  onToggleFullWidth?: () => void;
};

export function useKeyboardShortcuts({
  onViewModeChange,
  currentViewMode,
  onToggleFullWidth,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "Tab") {
        event.preventDefault();

        const viewModesCycle: ViewMode[] = ["split", "editor", "preview"];
        const currentIndex = viewModesCycle.indexOf(currentViewMode);
        const nextIndex = (currentIndex + 1) % viewModesCycle.length;
        const nextMode = viewModesCycle[nextIndex];

        onViewModeChange(nextMode);
      }

      if (event.key === "f" || event.key === "F") {
        if (currentViewMode === "preview" && onToggleFullWidth) {
          event.preventDefault();
          onToggleFullWidth();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentViewMode, onViewModeChange, onToggleFullWidth]);
}
