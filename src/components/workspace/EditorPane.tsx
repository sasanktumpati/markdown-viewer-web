"use client";

import type { ChangeEvent, CSSProperties } from "react";

type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
  style?: CSSProperties;
  className?: string;
  textareaId?: string;
};

export function EditorPane({
  value,
  onChange,
  style,
  className,
  textareaId,
}: EditorPaneProps) {
  const containerClassName = ["flex min-h-0 flex-1 flex-col", className]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <section style={style} className={containerClassName}>
      <div className="border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[var(--tracking-normal)] text-muted-foreground">
          Editor
        </h2>
      </div>
      <textarea
        id={textareaId}
        aria-label="Markdown editor"
        value={value}
        onChange={handleChange}
        placeholder="Type Markdown here..."
        spellCheck="false"
        className="flex-1 resize-none bg-transparent px-3 py-3 font-mono text-sm leading-relaxed text-foreground focus:outline-none sm:px-4 sm:py-4 sm:text-base"
      />
    </section>
  );
}
