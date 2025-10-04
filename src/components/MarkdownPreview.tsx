"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo } from "react";

import { EditorPane } from "@/components/workspace/EditorPane";
import { PreviewPane } from "@/components/workspace/PreviewPane";
import { SplitView } from "@/components/workspace/SplitView";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { useMarkdownRenderer } from "@/hooks/useMarkdownRenderer";
import { usePointerResize } from "@/hooks/usePointerResize";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const MOBILE_MIN_HEIGHT = "calc(100vh - 180px)";
const DESKTOP_MIN_HEIGHT = "65vh";
const PREVIEW_MIN_WIDTH = "280px";
const PREVIEW_MAX_WIDTH = "960px";

export default function MarkdownPreview() {
  const markdown = useWorkspaceStore((state) => state.markdown);
  const setMarkdown = useWorkspaceStore((state) => state.setMarkdown);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const splitRatio = useWorkspaceStore((state) => state.splitRatio);
  const setSplitRatio = useWorkspaceStore((state) => state.setSplitRatio);
  const previewWidthRatio = useWorkspaceStore(
    (state) => state.previewWidthRatio,
  );
  const setPreviewWidthRatio = useWorkspaceStore(
    (state) => state.setPreviewWidthRatio,
  );
  const isMobile = useWorkspaceStore((state) => state.isMobile);
  const setIsMobile = useWorkspaceStore((state) => state.setIsMobile);
  const isPreviewFullWidth = useWorkspaceStore(
    (state) => state.isPreviewFullWidth,
  );
  const setIsPreviewFullWidth = useWorkspaceStore(
    (state) => state.setIsPreviewFullWidth,
  );

  const { fallbackHtml, isRendering } = useMarkdownRenderer(markdown);

  const {
    containerRef,
    startSplitResize,
    startPreviewResize,
    cancelActiveResize,
  } = usePointerResize({
    isMobile,
    splitRatio,
    previewWidthRatio,
    onSplitRatioChange: setSplitRatio,
    onPreviewWidthRatioChange: setPreviewWidthRatio,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const applyMatch = (matches: boolean) => {
      if (useWorkspaceStore.getState().isMobile !== matches) {
        setIsMobile(matches);
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
  }, [setIsMobile]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }, []);

  useEffect(() => {
    if (viewMode) {
      cancelActiveResize();
    }
  }, [cancelActiveResize, viewMode]);

  const minHeight = useMemo(
    () => (isMobile ? MOBILE_MIN_HEIGHT : DESKTOP_MIN_HEIGHT),
    [isMobile],
  );

  const previewStyle = useMemo<CSSProperties>(() => {
    if (isMobile) {
      return {
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
      } satisfies CSSProperties;
    }

    if (isPreviewFullWidth) {
      return {
        width: "100%",
        maxWidth: PREVIEW_MAX_WIDTH,
        minWidth: PREVIEW_MIN_WIDTH,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
      } satisfies CSSProperties;
    }

    const widthPercent = `${Math.round(previewWidthRatio * 100)}%`;

    return {
      width: widthPercent,
      maxWidth: PREVIEW_MAX_WIDTH,
      minWidth: PREVIEW_MIN_WIDTH,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: widthPercent,
    } satisfies CSSProperties;
  }, [isMobile, isPreviewFullWidth, previewWidthRatio]);

  const previewActions = !isMobile ? (
    <PreviewWidthToggle
      isFullWidth={isPreviewFullWidth}
      onToggle={() => setIsPreviewFullWidth(!isPreviewFullWidth)}
    />
  ) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <WorkspaceHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        <main
          ref={containerRef}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card"
        >
          {viewMode === "split" && (
            <SplitView
              isMobile={isMobile}
              splitRatio={splitRatio}
              markdown={markdown}
              onMarkdownChange={setMarkdown}
              previewHtml={fallbackHtml}
              isRendering={isRendering}
              onResizeHandleDown={startSplitResize}
            />
          )}

          {viewMode === "editor" && (
            <EditorPane
              value={markdown}
              onChange={setMarkdown}
              className="flex-1"
              style={{ minHeight }}
            />
          )}

          {viewMode === "preview" && (
            <div
              className="flex min-h-0 flex-1 items-stretch justify-center px-3 py-4 sm:px-4 sm:py-6"
              style={{ minHeight }}
            >
              <PreviewPane
                html={fallbackHtml}
                isRendering={isRendering}
                style={previewStyle}
                className="border border-border"
                actions={previewActions}
                showResizeHandle={!isPreviewFullWidth && !isMobile}
                onResizeHandleDown={startPreviewResize}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

type PreviewWidthToggleProps = {
  isFullWidth: boolean;
  onToggle: () => void;
};

function PreviewWidthToggle({
  isFullWidth,
  onToggle,
}: PreviewWidthToggleProps) {
  const label = isFullWidth ? "Resize preview" : "Make preview full width";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      title={label}
      aria-label={label}
    >
      {isFullWidth ? (
        <ShrinkIcon title="Shrink preview width" />
      ) : (
        <ExpandIcon title="Expand preview width" />
      )}
    </button>
  );
}

type IconProps = {
  title: string;
};

function ExpandIcon({ title }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <title>{title}</title>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ShrinkIcon({ title }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <title>{title}</title>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}
