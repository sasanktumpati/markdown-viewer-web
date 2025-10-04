"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

import { EditorPane } from "@/components/workspace/EditorPane";
import { PreviewPane } from "@/components/workspace/PreviewPane";

type SplitViewProps = {
  isMobile: boolean;
  splitRatio: number;
  markdown: string;
  onMarkdownChange: (value: string) => void;
  previewHtml: string;
  isRendering: boolean;
  onResizeHandleDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function SplitView({
  isMobile,
  splitRatio,
  markdown,
  onMarkdownChange,
  previewHtml,
  isRendering,
  onResizeHandleDown,
}: SplitViewProps) {
  const containerStyle: CSSProperties = {
    flexDirection: isMobile ? "column" : "row",
    minHeight: isMobile ? "calc(100vh - 180px)" : "65vh",
  } satisfies React.CSSProperties;

  const editorStyle: CSSProperties = isMobile
    ? {
        flexBasis: 0,
        flexGrow: splitRatio,
        flexShrink: 1,
        minHeight: 0,
        width: "100%",
      }
    : {
        flexBasis: 0,
        flexGrow: splitRatio,
        flexShrink: 1,
        minHeight: 0,
        minWidth: 0,
      };

  const previewStyle: CSSProperties = isMobile
    ? {
        flexBasis: 0,
        flexGrow: 1 - splitRatio,
        flexShrink: 1,
        minHeight: 0,
        width: "100%",
      }
    : {
        flexBasis: 0,
        flexGrow: 1 - splitRatio,
        flexShrink: 1,
        minHeight: 0,
        minWidth: 0,
      };

  return (
    <div
      className="flex min-h-0 flex-1 w-full items-stretch"
      style={containerStyle}
    >
      <EditorPane
        value={markdown}
        onChange={onMarkdownChange}
        style={editorStyle}
        className="min-w-0"
      />

      <div
        onPointerDown={onResizeHandleDown}
        className="relative select-none touch-none"
        style={{
          flex: "0 0 auto",
          width: isMobile ? "100%" : "8px",
          height: isMobile ? "16px" : "auto",
          cursor: isMobile ? "row-resize" : "col-resize",
        }}
      >
        <div
          className="absolute bg-border"
          style={{
            width: isMobile ? "100%" : "1px",
            height: isMobile ? "1px" : "100%",
            top: isMobile ? "50%" : "0",
            left: isMobile ? "0" : "50%",
            transform: isMobile ? "translateY(-50%)" : "translateX(-50%)",
          }}
        />
      </div>

      <PreviewPane
        html={previewHtml}
        isRendering={isRendering}
        style={previewStyle}
        className="min-w-0"
      />
    </div>
  );
}
