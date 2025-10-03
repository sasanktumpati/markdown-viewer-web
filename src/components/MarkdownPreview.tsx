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

  const [html, setHtml] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<null | { type: "split" | "preview" }>(null);

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
      if (rect.width === 0) {
        return;
      }
      const relativeX = (event.clientX - rect.left) / rect.width;

      if (dragState.current.type === "split") {
        const clamped = Math.min(Math.max(relativeX, MIN_SPLIT), MAX_SPLIT);
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
  }, [setPreviewWidthRatio, setSplitRatio]);

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
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 md:py-8">
        <header
          className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3"
          role="banner"
        >
          <h1 className="text-sm font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
            Markdown Workspace
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap overflow-hidden rounded-[var(--radius-lg)] border border-border">
              {viewOptions.map((mode) => {
                const isActive = mode.value === viewmode;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setViewMode(mode.value)}
                    className={`px-3 py-2 text-sm transition-colors ${
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
          </div>
        </header>

        <main
          ref={containerRef}
          className="flex-1 rounded-[var(--radius-lg)] border border-border bg-card"
        >
          {viewmode === "split" && (
            <div className="flex h-full min-h-[65vh] w-full items-stretch flex-col-mobile">
              <section
                style={{
                  flexBasis: `${splitRatio * 100}%`,
                  flexGrow: 0,
                  flexShrink: 0,
                }}
                className="flex min-w-[240px] flex-col border-r border-border md:border-r-0"
              >
                <div className="border-b border-border px-4 py-3">
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
                  className="flex-1 resize-none bg-transparent px-4 py-4 font-mono text-base leading-relaxed text-foreground focus:outline-none"
                />
              </section>

              <div
                onPointerDown={startSplitResize}
                className="relative w-2 cursor-col-resize select-none md:cursor-row-resize"
              >
                <div className="absolute inset-y-0 left-1/2 -ml-px w-px bg-border md:hidden" />
                <div className="absolute inset-x-0 top-1/2 -mt-px h-px bg-border hidden md:block" />
              </div>

              <section
                style={{
                  flexBasis: `${(1 - splitRatio) * 100}%`,
                  flexGrow: 0,
                  flexShrink: 0,
                }}
                className="flex min-w-[240px] flex-col md:border-t md:border-border"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
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
                  className="prose prose-neutral max-w-none flex-1 overflow-auto px-4 py-4 text-base leading-relaxed prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized by marked.js and mermaid.js
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </section>
            </div>
          )}

          {viewmode === "editor" && (
            <section className="flex h-full min-h-[65vh] flex-col">
              <div className="border-b border-border px-4 py-3">
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
                className="flex-1 resize-none bg-transparent px-4 py-4 font-mono text-base leading-relaxed text-foreground focus:outline-none"
              />
            </section>
          )}

          {viewmode === "preview" && (
            <div className="flex h-full min-h-[65vh] w-full items-stretch justify-center px-4 py-6">
              <section
                style={{
                  width: `${Math.round(previewWidthRatio * 100)}%`,
                  maxWidth: "960px",
                  minWidth: "280px",
                }}
                className="relative flex flex-col border border-border w-full md:w-auto"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
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
                  className="prose prose-neutral max-w-none flex-1 overflow-auto px-4 py-4 text-base leading-relaxed prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized by DOMPurify before rendering
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
                <div
                  onPointerDown={startPreviewResize}
                  className="absolute inset-y-0 right-0 w-2 cursor-col-resize select-none"
                >
                  <span className="absolute inset-y-0 left-1/2 -ml-px w-px bg-border" />
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
