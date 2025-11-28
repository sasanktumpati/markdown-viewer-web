"use client";

import { clsx } from "clsx";
import { FilePlus, PanelLeftClose, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function Sidebar() {
  const isSidebarOpen = useWorkspaceStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useWorkspaceStore((state) => state.setSidebarOpen);
  const sessions = useWorkspaceStore((state) => state.sessions);
  const currentSessionId = useWorkspaceStore((state) => state.currentSessionId);
  const setCurrentSessionId = useWorkspaceStore(
    (state) => state.setCurrentSessionId,
  );
  const addSession = useWorkspaceStore((state) => state.addSession);
  const deleteSession = useWorkspaceStore((state) => state.deleteSession);
  const updateSession = useWorkspaceStore((state) => state.updateSession);
  const isMobile = useWorkspaceStore((state) => state.isMobile);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sort sessions by updated time desc
  const sortedSessions = Object.values(sessions).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleCreateSession = () => {
    addSession();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (Object.keys(sessions).length <= 1) return;
    deleteSession(id);
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleRenameSave = () => {
    if (editingId && editName.trim()) {
      updateSession(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSave();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  if (!isSidebarOpen) return null;

  return (
    <aside
      className={twMerge(
        "flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        isMobile
          ? "fixed inset-y-0 left-0 z-50 w-3/4 shadow-2xl"
          : "relative h-full w-64",
      )}
    >
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-sm font-semibold text-muted-foreground">
          FILES
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleCreateSession}
            className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
            title="New File (Cmd+N)"
          >
            <FilePlus size={18} />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Close Sidebar (Cmd+B)"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {sortedSessions.map((session) => (
            <li key={session.id}>
              {editingId === session.id ? (
                <div className="px-2 py-1">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleRenameSave}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-md border border-primary bg-background px-2 py-1 text-sm outline-none"
                  />
                </div>
              ) : (
                // biome-ignore lint/a11y/useSemanticElements: using div for button-like behavior with nested buttons
                <div
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setCurrentSessionId(session.id);
                      if (isMobile) setSidebarOpen(false);
                    }
                  }}
                  onDoubleClick={() =>
                    handleRenameStart(session.id, session.name)
                  }
                  role="button"
                  tabIndex={0}
                  className={clsx(
                    "group flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm transition-colors",
                    currentSessionId === session.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="truncate">{session.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className={clsx(
                      "opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100",
                      Object.keys(sessions).length <= 1 && "hidden",
                    )}
                    title="Delete File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
