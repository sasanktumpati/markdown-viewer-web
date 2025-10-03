"use client";

import hljs from "highlight.js/lib/common";
import { marked } from "marked";
import mermaid from "mermaid";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "highlight.js/styles/github.css";

import { useWorkspaceStore, type ViewMode } from "@/store/useWorkspaceStore";

const MIN_SPLIT = 0.25;
const MAX_SPLIT = 0.75;
const MIN_PREVIEW_WIDTH = 0.4;
const MAX_PREVIEW_WIDTH = 1;

export default function MarkdownPreview() {
  const markdown = useWorkspaceStore((state) => state.markdown);
  const setMarkdown = useWorkspaceStore((state) => state.setMarkdown);
  const viewmode = useWorkspaceStore((state) => state.viewMode);
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

  const [html, setHtml] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<null | { type: "split" | "preview" }>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
    dragState.current = null;
  }, [viewmode]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });

    const renderer = new marked.Renderer();
    const originalCode = renderer.code.bind(renderer);
    type CodeRendererParams = Parameters<(typeof renderer)["code"]>[0];

    renderer.code = (code: CodeRendererParams) => {
      const { text, lang } = code;
      const info = lang ?? "";
      const rawLang = info.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? "";
      const isSafeLang = /^[0-9a-z+-]+$/i.test(rawLang);
      const language = isSafeLang ? rawLang : "";

      if (language === "mermaid") {
        return originalCode(code);
      }

      let highlighted = "";
      let detectedLang = language;
      try {
        if (language && hljs.getLanguage(language)) {
          highlighted = hljs.highlight(text, { language }).value;
        } else {
          const autoResult = hljs.highlightAuto(text);
          highlighted = autoResult.value;
          detectedLang = autoResult.language?.toLowerCase() ?? detectedLang;
        }
      } catch (error) {
        console.error("Highlight error:", error);
        return originalCode(code);
      }

      const classNames = ["hljs"];
      if (detectedLang && /^[0-9a-z+-]+$/i.test(detectedLang)) {
        classNames.push(`language-${detectedLang}`);
      }

      return `<pre><code class="${classNames.join(" ")}">${highlighted}</code></pre>`;
    };

    marked.use({ renderer });
  }, []);

  useEffect(() => {
    const processMarkdown = async () => {
      if (!markdown.trim()) {
        setHtml("");
        return;
      }

      setIsRendering(true);

      try {
        const parsedHtml = await marked.parse(markdown);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = parsedHtml;

        const codeBlocks = tempDiv.querySelectorAll("code.language-mermaid");

        for (let i = 0; i < codeBlocks.length; i++) {
          const codeBlock = codeBlocks[i];
          const mermaidCode = codeBlock.textContent || "";

          try {
            const { svg } = await mermaid.render(
              `mermaid-${crypto.randomUUID()}-${i}`,
              mermaidCode,
            );

            const pre = codeBlock.parentElement;
            if (pre) {
              const div = document.createElement("div");
              div.className = "mermaid-diagram";
              div.innerHTML = svg;
              pre.replaceWith(div);
            }
          } catch (error) {
            console.error("Mermaid rendering error:", error);
          }
        }

        setHtml(tempDiv.innerHTML);
      } catch (error) {
        console.error("Markdown parsing error:", error);
        setHtml('<p class="text-destructive">Error parsing markdown.</p>');
      } finally {
        setIsRendering(false);
      }
    };

    const debounceTimer = setTimeout(processMarkdown, 200);
    return () => clearTimeout(debounceTimer);
  }, [markdown]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState.current) {
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;

      if (dragState.current.type === "split") {
        const ratio = isMobile ? relativeY : relativeX;
        const clamped = Math.min(Math.max(ratio, MIN_SPLIT), MAX_SPLIT);
        setSplitRatio(clamped);
      }
      if (dragState.current.type === "preview") {
        const clamped = Math.min(
          Math.max(relativeX, MIN_PREVIEW_WIDTH),
          MAX_PREVIEW_WIDTH,
        );
        setPreviewWidthRatio(clamped);
      }
    };

    const clearDrag = () => {
      dragState.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", clearDrag);
    window.addEventListener("pointercancel", clearDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", clearDrag);
      window.removeEventListener("pointercancel", clearDrag);
    };
  }, [setPreviewWidthRatio, setSplitRatio, isMobile]);

  const startSplitResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (viewmode !== "split") {
      return;
    }
    event.preventDefault();
    dragState.current = { type: "split" };
  };

  const startPreviewResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (viewmode !== "preview") {
      return;
    }
    event.preventDefault();
    dragState.current = { type: "preview" };
  };

  const previewContent = useMemo(
    () =>
      html ||
      '<p class="text-muted-foreground">Start typing to see a formatted preview.</p>',
    [html],
  );

  const viewOptions: Array<{ value: ViewMode; label: string }> = [
    { value: "split", label: "Split" },
    { value: "editor", label: "Editor" },
    { value: "preview", label: "Preview" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <header
          className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
          role="banner"
        >
          <h1 className="text-sm font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
            Markdown Workspace
          </h1>
          <nav className="flex w-full overflow-hidden rounded-[var(--radius-lg)] border border-border sm:w-auto">
            {viewOptions.map((mode) => {
              const isActive = mode.value === viewmode;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setViewMode(mode.value)}
                  className={`flex-1 px-3 py-2 text-sm transition-colors sm:flex-none ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </nav>
        </header>

        <main
          ref={containerRef}
          className="flex-1 rounded-[var(--radius-lg)] border border-border bg-card"
        >
          {viewmode === "split" && (
            <div
              className="flex h-full w-full items-stretch"
              style={{
                flexDirection: isMobile ? "column" : "row",
                minHeight: isMobile ? "calc(100vh - 180px)" : "65vh"
              }}
            >
              <section
                style={{
                  height: isMobile ? `${splitRatio * 100}%` : "auto",
                  width: isMobile ? "100%" : `${splitRatio * 100}%`,
                }}
                className="flex flex-col"
              >
                <div className="border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
                    Editor
                  </h2>
                </div>
                <textarea
                  aria-label="Markdown editor"
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                  placeholder="Type Markdown here..."
                  spellCheck="false"
                  className="flex-1 resize-none bg-transparent px-3 py-3 font-mono text-sm leading-relaxed text-foreground focus:outline-none sm:px-4 sm:py-4 sm:text-base"
                />
              </section>

              <div
                onPointerDown={startSplitResize}
                className="relative select-none touch-none"
                style={{
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

              <section
                style={{
                  height: isMobile ? `${(1 - splitRatio) * 100}%` : "auto",
                  width: isMobile ? "100%" : `${(1 - splitRatio) * 100}%`,
                }}
                className="flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
                    Preview
                  </h2>
                  {isRendering && (
                    <span className="text-xs text-muted-foreground">
                      Rendering…
                    </span>
                  )}
                </div>
                <div
                  ref={previewRef}
                  className="prose prose-neutral prose-sm max-w-none flex-1 overflow-auto px-3 py-3 leading-relaxed prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted sm:prose-base sm:px-4 sm:py-4"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized by marked.js and mermaid.js
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </section>
            </div>
          )}

          {viewmode === "editor" && (
            <section
              className="flex h-full flex-col"
              style={{ minHeight: isMobile ? "calc(100vh - 180px)" : "65vh" }}
            >
              <div className="border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                <h2 className="text-xs font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
                  Editor
                </h2>
              </div>
              <textarea
                aria-label="Markdown editor"
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
                placeholder="Type Markdown here..."
                spellCheck="false"
                className="flex-1 resize-none bg-transparent px-3 py-3 font-mono text-sm leading-relaxed text-foreground focus:outline-none sm:px-4 sm:py-4 sm:text-base"
              />
            </section>
          )}

          {viewmode === "preview" && (
            <div
              className="flex h-full w-full items-stretch justify-center px-3 py-4 sm:px-4 sm:py-6"
              style={{ minHeight: isMobile ? "calc(100vh - 180px)" : "65vh" }}
            >
              <section
                style={{
                  width: isPreviewFullWidth || isMobile ? "100%" : `${Math.round(previewWidthRatio * 100)}%`,
                  maxWidth: isPreviewFullWidth || isMobile ? "100%" : "960px",
                  minWidth: isMobile ? "100%" : "280px",
                }}
                className="relative flex flex-col border border-border w-full"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
                    Preview
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {isRendering && (
                      <span className="text-xs text-muted-foreground">
                        Rendering…
                      </span>
                    )}
                    {!isMobile && (
                      <button
                        type="button"
                        onClick={() => setIsPreviewFullWidth(!isPreviewFullWidth)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        title={isPreviewFullWidth ? "Resize preview" : "Full width"}
                      >
                      {isPreviewFullWidth ? (
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
                        >
                          <polyline points="4 14 10 14 10 20" />
                          <polyline points="20 10 14 10 14 4" />
                          <line x1="14" y1="10" x2="21" y2="3" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      ) : (
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
                        >
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      )}
                      </button>
                    )}
                  </div>
                </div>
                <div
                  ref={previewRef}
                  className="prose prose-neutral prose-sm max-w-none flex-1 overflow-auto px-3 py-3 leading-relaxed prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted sm:prose-base sm:px-4 sm:py-4"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized by DOMPurify before rendering
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
                {!isPreviewFullWidth && !isMobile && (
                  <div
                    onPointerDown={startPreviewResize}
                    className="absolute inset-y-0 right-0 w-2 cursor-col-resize select-none touch-none"
                  >
                    <span className="absolute inset-y-0 left-1/2 -ml-px w-px bg-border" />
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
