"use client";

import { useEffect } from "react";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function useAutoDarkMode() {
  const setIsDarkMode = useWorkspaceStore((state) => state.setIsDarkMode);

  useEffect(() => {
    if (typeof window === "undefined" || !useWorkspaceStore.getState().isAutoDarkMode) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyMatch = (matches: boolean) => {
      if (useWorkspaceStore.getState().isDarkMode !== matches) {
        setIsDarkMode(matches);
      }
    };

    applyMatch(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyMatch(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    const legacyHandler = () => applyMatch(mediaQuery.matches);
    mediaQuery.addListener(legacyHandler);
    return () => mediaQuery.removeListener(legacyHandler);
  }, [setIsDarkMode]);
}
