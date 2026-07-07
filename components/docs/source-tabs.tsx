"use client";

import { useRef, useState } from "react";
import { CodeBlock } from "./code-block-lazy";

interface SourceFile {
  name: string;
  code: string;
  language?: string;
}

export function SourceTabs({ files }: { files: SourceFile[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
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
    <div className="flex flex-col gap-2">
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
            className={`rounded-md px-3 py-1.5 font-mono text-xs outline-none transition-colors duration-(--motion-dur-fast) focus-visible:ring-2 focus-visible:ring-ring ${
              index === active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
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
      >
        <CodeBlock code={activeFile.code} language={activeFile.language} />
      </div>
    </div>
  );
}
