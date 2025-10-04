"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import "highlight.js/styles/github.css";

type MarkdownRenderer = (markdown: string) => Promise<string>;

let rendererPromise: Promise<MarkdownRenderer> | null = null;

const FALLBACK_ERROR_HTML =
  '<p class="text-destructive">Error parsing markdown.</p>';

const FALLBACK_EMPTY_HTML =
  '<p class="text-muted-foreground">Start typing to see a formatted preview.</p>';

const uniqueId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

async function createMarkdownRenderer(): Promise<MarkdownRenderer> {
  const [{ marked }, { default: mermaid }, { default: hljs }] =
    await Promise.all([
      import("marked"),
      import("mermaid"),
      import("highlight.js/lib/common"),
    ]);

  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
  });

  const renderer = new marked.Renderer();
  const originalCode = renderer.code.bind(renderer);

  renderer.code = (code) => {
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

  marked.use({ renderer, async: true, gfm: true });

  return async (markdown: string) => {
    const parsedHtml = await marked.parse(markdown, { async: true });
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = parsedHtml;

    const codeBlocks = Array.from(
      tempDiv.querySelectorAll<HTMLPreElement>("code.language-mermaid"),
    );

    await Promise.all(
      codeBlocks.map(async (codeBlock, index) => {
        const mermaidCode = codeBlock.textContent ?? "";
        if (!mermaidCode) {
          return;
        }

        try {
          const { svg } = await mermaid.render(
            `mermaid-${index}-${uniqueId()}`,
            mermaidCode,
          );

          const pre = codeBlock.parentElement;
          if (!pre) {
            return;
          }

          const div = document.createElement("div");
          div.className = "mermaid-diagram";
          div.innerHTML = svg;
          pre.replaceWith(div);
        } catch (error) {
          console.error("Mermaid rendering error:", error);
        }
      }),
    );

    return tempDiv.innerHTML;
  };
}

async function getMarkdownRenderer(): Promise<MarkdownRenderer> {
  if (!rendererPromise) {
    rendererPromise = createMarkdownRenderer();
  }
  return rendererPromise;
}

type RenderState = {
  html: string;
  isRendering: boolean;
};

export function useMarkdownRenderer(markdown: string): RenderState & {
  fallbackHtml: string;
} {
  const deferredMarkdown = useDeferredValue(markdown);
  const [state, setState] = useState<RenderState>({
    html: "",
    isRendering: false,
  });

  useEffect(() => {
    const trimmed = deferredMarkdown.trim();

    if (!trimmed) {
      setState((previous) =>
        previous.html === "" && !previous.isRendering
          ? previous
          : { html: "", isRendering: false },
      );
      return;
    }

    let cancelled = false;
    setState((previous) =>
      previous.isRendering ? previous : { ...previous, isRendering: true },
    );

    const render = async () => {
      try {
        const renderer = await getMarkdownRenderer();
        const html = await renderer(trimmed);
        if (cancelled) {
          return;
        }

        setState((previous) => {
          if (previous.html === html) {
            return previous.isRendering
              ? { ...previous, isRendering: false }
              : previous;
          }
          return { html, isRendering: false };
        });
      } catch (error) {
        console.error("Markdown parsing error:", error);
        if (!cancelled) {
          setState((previous) =>
            previous.html === FALLBACK_ERROR_HTML && !previous.isRendering
              ? previous
              : { html: FALLBACK_ERROR_HTML, isRendering: false },
          );
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [deferredMarkdown]);

  const fallbackHtml = useMemo(
    () => state.html || FALLBACK_EMPTY_HTML,
    [state.html],
  );

  return { ...state, fallbackHtml };
}
