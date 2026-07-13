"use client";

import { motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { CodeBlock } from "./code-block-lazy";
import { ScrollFade } from "./scroll-fade";

interface SourceFile {
  name: string;
  code: string;
  language?: string;
}

type SourceTabsProps = {
  files: SourceFile[];
  /** Controlled active-tab index — omit for the uncontrolled default (most callers). */
  active?: number;
  onActiveChange?: (index: number) => void;
} & (
  | { fillHeight?: false; codeBackground?: never }
  | { fillHeight: true; codeBackground: string }
);

export function SourceTabs({
  files,
  active: controlledActive,
  onActiveChange,
  fillHeight = false,
  codeBackground,
}: SourceTabsProps) {
  const [internalActive, setInternalActive] = useState(0);
  const active = controlledActive ?? internalActive;
  const setActive = onActiveChange ?? setInternalActive;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const layoutId = useId();
  if (files.length === 0) return null;
  const activeFile = files[Math.min(active, files.length - 1)];

  const moveFocus = (index: number) => {
    setActive(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus((active + 1) % files.length);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocus((active - 1 + files.length) % files.length);
        break;
      case "Home":
        event.preventDefault();
        moveFocus(0);
        break;
      case "End":
        event.preventDefault();
        moveFocus(files.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${fillHeight ? "h-full" : ""}`}>
      <div
        role="tablist"
        aria-label="Source files"
        className="flex flex-wrap gap-1"
        onKeyDown={handleKeyDown}
      >
        {files.map((file, index) => (
          <button
            key={file.name}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={`source-tab-${file.name}`}
            role="tab"
            type="button"
            aria-selected={index === active}
            aria-controls={`source-panel-${file.name}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            className={`relative rounded-md px-3 py-1.5 font-mono text-xs outline-none transition-colors duration-(--motion-dur-fast) focus-ring ${
              index === active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {index === active && (
              <motion.span
                layoutId={`${layoutId}-active-tab`}
                className="-z-10 absolute inset-0 rounded-md bg-muted"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            {file.name}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`source-panel-${activeFile.name}`}
        aria-labelledby={`source-tab-${activeFile.name}`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA APG tabpanel must be focusable so keyboard users can scroll its content
        tabIndex={0}
        className={
          fillHeight ? "relative min-h-0 flex-1" : "rounded-lg bg-muted"
        }
      >
        {fillHeight && codeBackground && (
          <>
            <ScrollFade position="top" background={codeBackground} />
            <ScrollFade position="bottom" background={codeBackground} />
          </>
        )}
        <CodeBlock
          code={activeFile.code}
          language={activeFile.language}
          fillHeight={fillHeight}
          hideScrollbar={fillHeight}
        />
      </div>
    </div>
  );
}
