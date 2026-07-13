"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import type { SourceFile } from "@/lib/registry-loader";

interface CodeSheetState {
  open: boolean;
  files: SourceFile[];
  openSheet: (files: SourceFile[], trigger?: HTMLElement | null) => void;
  closeSheet: () => void;
}

const CodeSheetContext = createContext<CodeSheetState | null>(null);

/**
 * Drives the code sheet choreography (docs/05-site/component-page.md ->
 * "The code sheet"): both docs sidebars collapse, a fixed panel slides in
 * from the right with the source. One provider at the (docs) layout level
 * so the left sidebar (layout.tsx) and the trigger button (deep in a
 * page's Installation section) can share the same open state without prop
 * drilling. `open` stays false on pages that never call `openSheet` —
 * harmless no-op on /systems, which keeps its own inline Source section.
 */
export function CodeSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<SourceFile[]>([]);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openSheet = (nextFiles: SourceFile[], trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null;
    setFiles(nextFiles);
    setOpen(true);
  };

  const closeSheet = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <CodeSheetContext.Provider value={{ open, files, openSheet, closeSheet }}>
      {children}
    </CodeSheetContext.Provider>
  );
}

export function useCodeSheet() {
  const ctx = useContext(CodeSheetContext);
  if (!ctx) {
    throw new Error("useCodeSheet must be used within a CodeSheetProvider");
  }
  return ctx;
}
