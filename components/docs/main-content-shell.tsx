"use client";

import type { ReactNode } from "react";
import { useCodeSheet } from "./code-sheet-context";

/**
 * Wraps the article column so it actually yields width when the code
 * sheet opens, instead of sitting underneath a fixed overlay with text
 * running behind it. Technique studied from the craft reference
 * (components/panels/preview-panel.tsx + info-panel.tsx): sibling panels
 * transition `width`/`margin` together via a `data-*` attribute, not a
 * ternary className string — kept that convention here too, matching
 * Aster's own existing idiom (Base UI's data-dragging/data-disabled on
 * Fader). The margin value must clear the sheet's own width
 * (`min(36rem, viewport - margin)`) plus its `right-4` offset.
 */
export function MainContentShell({ children }: { children: ReactNode }) {
  const { open } = useCodeSheet();

  return (
    <div
      data-sheet-open={open}
      className="min-w-0 flex-1 transition-[margin] duration-300 ease-in-out data-[sheet-open=true]:md:mr-148"
    >
      {children}
    </div>
  );
}
