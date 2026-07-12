"use client";

import type { ReactNode } from "react";
import { useCodeSheet } from "./code-sheet-context";

/**
 * Wraps the right-side TOC so it width-collapses when the code sheet
 * opens — a focus-mode gesture, not a space requirement.
 */
export function CollapsibleAside({ children }: { children: ReactNode }) {
  const { open } = useCodeSheet();

  return (
    <aside
      data-open={!open}
      inert={open ? true : undefined}
      className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col overflow-hidden rounded-2xl bg-muted/40 opacity-100 transition-[width,opacity] duration-(--motion-dur-slow) ease-(--motion-ease-out) xl:flex motion-reduce:transition-none data-[open=false]:w-0 data-[open=false]:opacity-0"
    >
      <div className="flex h-full w-64 shrink-0 flex-col gap-6 p-6">
        {children}
      </div>
    </aside>
  );
}
