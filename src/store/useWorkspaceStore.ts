import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ViewMode = "split" | "editor" | "preview";

type WorkspaceState = {
  markdown: string;
  viewMode: ViewMode;
  splitRatio: number;
  previewWidthRatio: number;
  setMarkdown: (value: string) => void;
  setViewMode: (value: ViewMode) => void;
  setSplitRatio: (value: number) => void;
  setPreviewWidthRatio: (value: number) => void;
};

const STORAGE_KEY = "markdown-workspace";

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      markdown: "",
      viewMode: "split",
      splitRatio: 0.5,
      previewWidthRatio: 0.7,
      setMarkdown: (value) => set({ markdown: value }),
      setViewMode: (value) => set({ viewMode: value }),
      setSplitRatio: (value) => set({ splitRatio: value }),
      setPreviewWidthRatio: (value) => set({ previewWidthRatio: value }),
    }),
    {
      name: STORAGE_KEY,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : undefined,
      partialize: (state) => ({
        markdown: state.markdown,
        viewMode: state.viewMode,
        splitRatio: state.splitRatio,
        previewWidthRatio: state.previewWidthRatio,
      }),
    },
  ),
);
