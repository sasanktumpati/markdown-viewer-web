import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createDeferredStateStorage } from "@/store/createDeferredStateStorage";

export type ViewMode = "split" | "editor" | "preview";

export type Session = {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

type WorkspaceState = {
  sessions: Record<string, Session>;
  currentSessionId: string;
  isSidebarOpen: boolean;
  viewMode: ViewMode;
  splitRatio: number;
  previewWidthRatio: number;
  isMobile: boolean;
  isPreviewFullWidth: boolean;
  isDarkMode: boolean;

  // Actions
  addSession: () => string;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  setCurrentSessionId: (id: string) => void;
  setMarkdown: (value: string) => void; // Convenience to update current session
  setSidebarOpen: (isOpen: boolean) => void;
  setViewMode: (value: ViewMode) => void;
  setSplitRatio: (value: number) => void;
  setPreviewWidthRatio: (value: number) => void;
  setIsMobile: (value: boolean) => void;
  setIsPreviewFullWidth: (value: boolean) => void;
  setIsDarkMode: (value: boolean) => void;
};

const STORAGE_KEY = "markdown-workspace";

const storage = createJSONStorage(() =>
  createDeferredStateStorage({ flushDelayMs: 200 }),
);

const DEFAULT_SESSION_ID = uuidv4();

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      sessions: {
        [DEFAULT_SESSION_ID]: {
          id: DEFAULT_SESSION_ID,
          name: "Untitled",
          content: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
      currentSessionId: DEFAULT_SESSION_ID,
      isSidebarOpen: true,
      viewMode: "split",
      splitRatio: 0.5,
      previewWidthRatio: 0.7,
      isMobile: false,
      isPreviewFullWidth: false,
      isDarkMode: false,

      addSession: () => {
        const id = uuidv4();
        const newSession: Session = {
          id,
          name: "Untitled",
          content: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state: WorkspaceState) => ({
          sessions: { ...state.sessions, [id]: newSession },
          currentSessionId: id,
        }));
        return id;
      },

      updateSession: (id: string, updates: Partial<Session>) => {
        set((state: WorkspaceState) => {
          const session = state.sessions[id];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [id]: { ...session, ...updates, updatedAt: Date.now() },
            },
          };
        });
      },

      deleteSession: (id: string) => {
        set((state: WorkspaceState) => {
          const { [id]: _deleted, ...remainingSessions } = state.sessions;
          const sessionIds = Object.keys(remainingSessions);

          // Prevent deleting the last session
          if (sessionIds.length === 0) {
            const newId = uuidv4();
            return {
              sessions: {
                [newId]: {
                  id: newId,
                  name: "Untitled",
                  content: "",
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              },
              currentSessionId: newId,
            };
          }

          let nextSessionId = state.currentSessionId;
          if (state.currentSessionId === id) {
            // Switch to the most recently updated session, or just the first one
            nextSessionId = sessionIds[0];
          }

          return {
            sessions: remainingSessions,
            currentSessionId: nextSessionId,
          };
        });
      },

      setCurrentSessionId: (id: string) => set({ currentSessionId: id }),

      setMarkdown: (value: string) => {
        const { currentSessionId, updateSession } = get();
        updateSession(currentSessionId, { content: value });
      },

      setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
      setViewMode: (value: ViewMode) => set({ viewMode: value }),
      setSplitRatio: (value: number) => set({ splitRatio: value }),
      setPreviewWidthRatio: (value: number) =>
        set({ previewWidthRatio: value }),
      setIsMobile: (value: boolean) => set({ isMobile: value }),
      setIsPreviewFullWidth: (value: boolean) =>
        set({ isPreviewFullWidth: value }),
      setIsDarkMode: (value: boolean) => set({ isDarkMode: value }),
    }),
    {
      name: STORAGE_KEY,
      storage,
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        isSidebarOpen: state.isSidebarOpen,
        viewMode: state.viewMode,
        splitRatio: state.splitRatio,
        previewWidthRatio: state.previewWidthRatio,
        isDarkMode: state.isDarkMode,
      }),
      // biome-ignore lint/suspicious/noExplicitAny: state is untyped during rehydration
      onRehydrateStorage: () => (state: any) => {
        // Migration logic for old state
        if (state && typeof state.markdown === "string") {
          const newId = uuidv4();
          state.sessions = {
            [newId]: {
              id: newId,
              name: "Recovered Session",
              content: state.markdown,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          };
          state.currentSessionId = newId;
          delete state.markdown;
        }
        // Ensure we always have at least one session
        if (
          state &&
          (!state.sessions || Object.keys(state.sessions).length === 0)
        ) {
          const newId = uuidv4();
          state.sessions = {
            [newId]: {
              id: newId,
              name: "Untitled",
              content: "",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          };
          state.currentSessionId = newId;
        }
      },
    },
  ),
);
