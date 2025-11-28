"use client";

import { Command } from "cmdk";
import { FilePlus, Moon, PanelLeft, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const sessions = useWorkspaceStore((state) => state.sessions);
  const currentSessionId = useWorkspaceStore((state) => state.currentSessionId);
  const setCurrentSessionId = useWorkspaceStore(
    (state) => state.setCurrentSessionId,
  );
  const addSession = useWorkspaceStore((state) => state.addSession);
  const isSidebarOpen = useWorkspaceStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useWorkspaceStore((state) => state.setSidebarOpen);
  const isDarkMode = useWorkspaceStore((state) => state.isDarkMode);
  const setIsDarkMode = useWorkspaceStore((state) => state.setIsDarkMode);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* biome-ignore lint/a11y/useSemanticElements: backdrop needs to be a div for proper layering */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            setOpen(false);
          }
        }}
        role="button"
        tabIndex={0}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-100">
        <Command className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground">
          <div
            className="flex items-center border-b px-3"
            cmdk-input-wrapper=""
          >
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search files..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
            <Command.Empty className="py-6 text-center text-sm">
              No results found.
            </Command.Empty>

            <Command.Group heading="Files">
              {Object.values(sessions).map((session) => (
                <Command.Item
                  key={session.id}
                  onSelect={() => {
                    runCommand(() => setCurrentSessionId(session.id));
                  }}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="mr-2">
                    {session.id === currentSessionId ? "•" : " "}
                  </span>
                  {session.name}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => runCommand(() => addSession())}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <FilePlus className="mr-2 h-4 w-4" />
                <span>Create New File</span>
                <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                  ⌘N
                </span>
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(() => setSidebarOpen(!isSidebarOpen))
                }
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <PanelLeft className="mr-2 h-4 w-4" />
                <span>{isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}</span>
                <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                  ⌘B
                </span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setIsDarkMode(!isDarkMode))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                {isDarkMode ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                <span>Toggle Theme</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
