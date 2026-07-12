"use client";

import { useEffect, useRef, useState } from "react";

interface PromptFile {
  name: string;
  code: string;
  language?: string;
}

function buildPrompt(name: string, files: PromptFile[]): string {
  const fileBlocks = files
    .map(
      (file) =>
        `### ${file.name}\n\`\`\`${file.language ?? "tsx"}\n${file.code}\n\`\`\``,
    )
    .join("\n\n");
  return `Add the "${name}" component below to my project, matching my existing project structure and conventions. Create or update the files exactly as shown, then wire up any imports it needs.\n\n${fileBlocks}`;
}

/**
 * Copies an AI-agent-ready prompt (file contents + an add-this-component
 * instruction) — a second install path alongside the CLI command
 * (InstallCommand), for pasting into Claude Code / Cursor / etc. See
 * docs/05-site/component-page.md -> reference screenshots (2026-07-11).
 */
export function CopyPrompt({
  name,
  files,
}: {
  name: string;
  files: PromptFile[];
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (files.length === 0) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        try {
          await navigator.clipboard.writeText(buildPrompt(name, files));
        } catch {
          return; // clipboard unavailable (permissions/insecure context)
        }
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 1500);
      }}
      className="flex h-9 items-center squircle bg-muted px-3 font-mono text-xs text-muted-foreground outline-none transition-colors duration-(--motion-dur-fast) hover:bg-muted/80 hover:text-foreground focus-ring"
    >
      {copied ? "copied" : "Copy prompt"}
      {/* Status lives outside any aria-label'd ancestor so it's reliably announced. */}
      <span aria-live="polite" className="sr-only">
        {copied ? "Prompt copied to clipboard" : ""}
      </span>
    </button>
  );
}
