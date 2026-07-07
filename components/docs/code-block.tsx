"use client";

import { Highlight, themes } from "prism-react-renderer";

export function CodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: string;
}) {
  return (
    <Highlight theme={themes.oneDark} code={code.trimEnd()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} max-h-96 overflow-auto rounded-lg border border-border p-4 text-[13px] leading-relaxed`}
          style={{ ...style }}
        >
          {tokens.map((line, lineIndex) => (
            // key after the spread so prism props can never overwrite it
            // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
            <div {...getLineProps({ line })} key={lineIndex}>
              {line.map((token, tokenIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                <span {...getTokenProps({ token })} key={tokenIndex} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
