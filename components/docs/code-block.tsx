"use client";

import { useTheme } from "next-themes";
import { Highlight, themes } from "prism-react-renderer";

export function CodeBlock({
  code,
  language = "tsx",
  fillHeight = false,
  hideScrollbar = false,
}: {
  code: string;
  language?: string;
  /** Fill the parent's height instead of capping at max-h-96 — the Source
   * sheet has its own dedicated scroll container and real vertical room
   * to give the code, unlike an inline demo's code toggle. */
  fillHeight?: boolean;
  hideScrollbar?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? themes.oneDark : themes.oneLight;

  return (
    <Highlight theme={theme} code={code.trim()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} ${fillHeight ? "h-full" : "max-h-96"} overflow-auto py-4 px-4 text-xs leading-relaxed ${hideScrollbar ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"}`}
          style={{ ...style, backgroundColor: "transparent" }}
        >
          {tokens.map((line, lineIndex) => {
            // Prism sometimes leaves a trailing empty line even after trim()
            if (
              lineIndex === tokens.length - 1 &&
              line.length === 1 &&
              line[0].empty
            ) {
              return null;
            }
            if (
              lineIndex === tokens.length - 1 &&
              line.every((t) => !t.content.trim())
            ) {
              return null;
            }
            const { className: lineClassName, ...lineProps } = getLineProps({
              line,
            });
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
                key={lineIndex}
                className={`${lineClassName ?? ""} flex`}
                {...lineProps}
              >
                <span className="mr-4 w-4 shrink-0 select-none text-right text-muted-foreground/50">
                  {lineIndex + 1}
                </span>
                <span>
                  {line.map((token, tokenIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                    <span {...getTokenProps({ token })} key={tokenIndex} />
                  ))}
                </span>
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}
