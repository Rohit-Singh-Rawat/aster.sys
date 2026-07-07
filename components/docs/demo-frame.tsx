"use client";

import { type ReactNode, useState } from "react";
import { CodeBlock } from "./code-block-lazy";

export function DemoFrame({
  name,
  code,
  children,
}: {
  name: string;
  code: string;
  children: ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  return (
    <section className="overflow-hidden rounded-xl border border-border">
      <header className="flex items-center justify-between border-b border-border py-1 pr-1 pl-4">
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {name}
        </span>
        {code.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCode((value) => !value)}
            className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground outline-none transition-colors duration-(--motion-dur-fast) hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showCode ? "Preview" : "Code"}
          </button>
        )}
      </header>
      {showCode ? (
        <div className="p-2">
          <CodeBlock code={code} />
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center p-8">
          {children}
        </div>
      )}
    </section>
  );
}
