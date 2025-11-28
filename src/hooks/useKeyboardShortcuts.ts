import { useEffect } from "react";
import type { ViewMode } from "@/store/useWorkspaceStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

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
  const addSession = useWorkspaceStore((state) => state.addSession);
  const setSidebarOpen = useWorkspaceStore((state) => state.setSidebarOpen);
  const isSidebarOpen = useWorkspaceStore((state) => state.isSidebarOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle Sidebar: Cmd+B (or Ctrl+B)
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault();
        setSidebarOpen(!isSidebarOpen);
      }

      // New File: Cmd+N (or Ctrl+N)
      if ((event.metaKey || event.ctrlKey) && event.key === "n") {
        event.preventDefault();
        addSession();
      }

      // Cycle View Modes: Shift+Tab
      if (event.shiftKey && event.key === "Tab") {
        event.preventDefault();

        const viewModesCycle: ViewMode[] = ["split", "editor", "preview"];
        const currentIndex = viewModesCycle.indexOf(currentViewMode);
        const nextIndex = (currentIndex + 1) % viewModesCycle.length;
        const nextMode = viewModesCycle[nextIndex];

        onViewModeChange(nextMode);
      }

      // Toggle Full Width Preview: F (only in preview mode)
      if (
        (event.key === "f" || event.key === "F") &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target instanceof HTMLInputElement)
      ) {
        if (currentViewMode === "preview" && onToggleFullWidth) {
          event.preventDefault();
          onToggleFullWidth();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentViewMode,
    onViewModeChange,
    onToggleFullWidth,
    addSession,
    isSidebarOpen,
    setSidebarOpen,
  ]);
}
