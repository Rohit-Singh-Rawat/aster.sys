"use client";

import { CopyButton } from "../ui/copy-button";
import { CodeBlock } from "./code-block-lazy";

/** Fenced-code-block renderer for MDX content — CodeBlock plus a copy button, since MDX's `pre` has no copy affordance on its own. */
export function MdxCodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="relative mb-4 rounded-lg bg-muted">
      <CodeBlock code={code} language={language} />
      <CopyButton
        value={code}
        className="absolute top-2 right-2 size-7 text-muted-foreground outline-none transition-colors duration-(--motion-dur-fast) hover:bg-muted-foreground/20 hover:text-foreground focus-ring"
      />
    </div>
  );
}
