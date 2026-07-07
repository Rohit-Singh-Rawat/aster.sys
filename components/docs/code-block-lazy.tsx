"use client";

import dynamic from "next/dynamic";

/**
 * Code-split CodeBlock: keeps prism-react-renderer out of the doc page's
 * main chunk — it loads only when a code view actually renders (Source
 * tabs, or the DemoFrame "Code" toggle).
 */
export const CodeBlock = dynamic(
  () => import("./code-block").then((mod) => mod.CodeBlock),
  {
    loading: () => (
      <pre
        aria-hidden="true"
        className="max-h-96 min-h-24 overflow-auto rounded-lg border border-border p-4"
      />
    ),
  },
);
