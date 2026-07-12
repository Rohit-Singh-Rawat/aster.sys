"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type Ref, useEffect, useRef, useState } from "react";
import { useCodeSheet } from "./code-sheet-context";
import { SourceTabs } from "./source-tabs";
import { CopyButton } from "../ui/copy-button";
import DownloadIcon from "../icons/download";

/**
 * Mirrors --motion-dur-slow / --motion-ease-in-out
 * (registry/aster/lib/motion-tokens.ts) — motion/react needs the
 * cubic-bezier as an array, not the CSS custom-property string.
 */
const SHEET_TRANSITION = { duration: 0.32, ease: [0.65, 0, 0.35, 1] as const };

/**
 * The panel's fill matches the sidebar's actual rendered tone
 * (`bg-muted/40` over `bg-background` — app/(docs)/layout.tsx), not the
 * raw --muted token, which alone reads too dark next to it. Kept as a
 * separate constant (for ScrollFade's inline `background` prop) from the
 * Tailwind class below because Tailwind's arbitrary-value scanner needs
 * the literal class text in source — it can't consume a shared JS
 * constant — so the two must be kept in sync by hand.
 */
const SOURCE_PANEL_BG =
  "color-mix(in oklch, var(--muted) 40%, var(--background) 60%)";

function HeaderIconButton({
  label,
  onClick,
  children,
  ref,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-(--motion-dur-fast) hover:bg-muted hover:text-foreground focus-ring"
    >
      {children}
    </button>
  );
}

/**
 * The sliding code panel. Header layout (title left, icon-only copy /
 * download / close on the right, no tab-like button chrome) and the
 * copy/download actions themselves are studied from the sibling craft
 * project (components/panels/code-drawer.tsx) — technique adopted, not
 * copied verbatim (per philosophy.md "Learn, Don't Copy"). Entrance
 * choreography detailed in the git history / component-page.md "V3 —
 * animation rebuilt from a real reference": Y-axis slide, blur-on-exit,
 * backdrop only below `md`. Never touches the app's own left nav
 * sidebar — matches craft, whose drawer never touches its host layout's
 * navigation either.
 */
export function CodeSheet() {
  const { open, files, closeSheet } = useCodeSheet();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const activeFile = files[Math.min(activeFileIndex, files.length - 1)];

  useEffect(() => {
    if (!open) return;
    setActiveFileIndex(0);
    closeButtonRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSheet();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeSheet]);

  function handleDownload() {
    if (!activeFile) return;
    const blob = new Blob([activeFile.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={closeSheet}
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 pointer-events-auto md:bg-transparent md:pointer-events-none"
          />
          <div className="sticky top-0 left-0 w-full h-[100dvh] flex items-end md:items-start justify-end pointer-events-none p-4">
            <motion.section
              aria-label="Source code"
              initial={reducedMotion ? false : { y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { y: "100%", opacity: 0, filter: "blur(4px)" }
              }
              transition={reducedMotion ? { duration: 0 } : SHEET_TRANSITION}
              className="pointer-events-auto flex h-[85vh] w-full flex-col overflow-hidden overscroll-contain rounded-2xl bg-[color-mix(in_oklch,var(--muted)_40%,var(--background)_60%)] md:h-full md:w-[min(36rem,calc(100vw-2rem))]"
            >
              <div className="flex h-full w-full min-w-0 flex-col">
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <h2 className="font-medium text-base tracking-tight">
                    Source Code
                  </h2>
                  <div className="flex items-center gap-0.5">
                    <CopyButton value={activeFile?.code || ""} />
                    <HeaderIconButton
                      label="Download file"
                      onClick={handleDownload}
                    >
                      <DownloadIcon className="size-[15px] stroke-[1.5]" aria-hidden="true" />
                    </HeaderIconButton>
                    <HeaderIconButton
                      ref={closeButtonRef}
                      label="Close source panel"
                      onClick={closeSheet}
                    >
                      <svg
                        aria-hidden="true"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </HeaderIconButton>
                  </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col p-4">
                  <SourceTabs
                    files={files}
                    active={activeFileIndex}
                    onActiveChange={setActiveFileIndex}
                    fillHeight
                    codeBackground={SOURCE_PANEL_BG}
                  />
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
