"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import mermaid from "mermaid";

import "highlight.js/styles/github-dark.css";

const FALLBACK_ERROR_HTML =
  '<p class="text-destructive">Error parsing markdown.</p>';

const FALLBACK_EMPTY_HTML =
  '<p class="text-muted-foreground">Start typing to see a formatted preview.</p>';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDirective)
  .use(remarkFrontmatter)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize)
  .use(rehypeHighlight, { ignoreMissing: true })
  .use(rehypeFormat)
  .use(rehypeStringify);

async function renderMarkdown(markdown: string): Promise<string> {
  try {
    const file = await processor.process(markdown);
    let html = String(file);

    // Mermaid rendering
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const mermaidElements = tempDiv.querySelectorAll(".language-mermaid");
    await Promise.all(
      Array.from(mermaidElements).map(async (element, i) => {
        const id = `mermaid-diagram-${i}`;
        const code = element.textContent || "";
        try {
          const { svg } = await mermaid.render(id, code);
          element.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          element.innerHTML = "Error rendering Mermaid diagram.";
        }
      }),
    );
    html = tempDiv.innerHTML;

    return html;
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return FALLBACK_ERROR_HTML;
  }
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
    mermaid.initialize({ startOnLoad: false });
  }, []);

  useEffect(() => {
    const trimmed = deferredMarkdown.trim();

    if (!trimmed) {
      setState({ html: "", isRendering: false });
      return;
    }

    let cancelled = false;
    setState((previous) => ({ ...previous, isRendering: true }));

    renderMarkdown(trimmed).then((html) => {
      if (!cancelled) {
        setState({ html, isRendering: false });
      }
    });

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
