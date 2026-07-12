"use client";

import type { SourceFile } from "@/lib/registry-loader";
import { useCodeSheet } from "./code-sheet-context";
import { motion } from "motion/react";

export function CodeSheetTrigger({ files }: { files: SourceFile[] }) {
  const { openSheet, open } = useCodeSheet();

  if (files.length === 0) return null;

  return (
    <motion.button
      type="button"
      onClick={(event) => openSheet(files, event.currentTarget)}
      className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap squircle bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-950/90 dark:hover:bg-zinc-50/90 px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      whileHover="hover"
      initial={false}
      animate={open ? "hover" : "rest"}
    >
      <motion.svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: "visible" }}
      >
        <motion.polyline
          points="8 6 2 12 8 18"
          variants={{ rest: { x: 0 }, hover: { x: -3 } }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
        <motion.polyline
          points="16 18 22 12 16 6"
          variants={{ rest: { x: 0 }, hover: { x: 3 } }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </motion.svg>
      Code
    </motion.button>
  );
}
