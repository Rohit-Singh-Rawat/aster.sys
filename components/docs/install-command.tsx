"use client";

import { useEffect, useRef, useState } from "react";

export function InstallCommand({ name }: { name: string }) {
  const command = `bunx shadcn@latest add @aster/${name}`;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 self-start rounded-lg border border-border bg-muted py-1 pr-1 pl-3 font-mono text-xs">
      <span>{command}</span>
      <button
        type="button"
        aria-label="Copy install command"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
          } catch {
            return; // clipboard unavailable (permissions/insecure context)
          }
          setCopied(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setCopied(false), 1500);
        }}
        className="rounded-md px-2 py-1.5 text-muted-foreground outline-none transition-colors duration-(--motion-dur-fast) hover:bg-background/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? "copied" : "copy"}
      </button>
      {/* Status lives outside the aria-label'd button: descendants of a
          name-overridden control aren't reliably announced as live text. */}
      <span aria-live="polite" className="sr-only">
        {copied ? "Install command copied to clipboard" : ""}
      </span>
    </div>
  );
}
