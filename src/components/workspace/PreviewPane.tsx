"use client";

import type {
  CSSProperties,
  ReactNode,
  PointerEvent as ReactPointerEvent,
} from "react";

type PreviewPaneProps = {
  html: string;
  isRendering: boolean;
  style?: CSSProperties;
  className?: string;
  actions?: ReactNode;
  showResizeHandle?: boolean;
  onResizeHandleDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function PreviewPane({
  html,
  isRendering,
  style,
  className,
  actions,
  showResizeHandle,
  onResizeHandleDown,
}: PreviewPaneProps) {
  const containerClassName = [
    "flex flex-col flex-1",
    showResizeHandle ? "relative" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section style={style} className={containerClassName}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
          Preview
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          {isRendering && (
            <span className="text-xs text-muted-foreground">Rendering…</span>
          )}
          {actions}
        </div>
      </div>
      <div
        className="prose prose-neutral prose-sm max-w-none flex-1 overflow-auto px-3 py-3 leading-relaxed prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted sm:prose-base sm:px-4 sm:py-4"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is produced by marked/mermaid processing
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {showResizeHandle && (
        <div
          onPointerDown={onResizeHandleDown}
          className="absolute inset-y-0 right-0 w-2 cursor-col-resize select-none touch-none"
        >
          <span className="absolute inset-y-0 left-1/2 -ml-px w-px bg-border" />
        </div>
      )}
    </section>
  );
}
