import * as React from "react";

interface TypeDisplayProps {
  type: string;
}

/**
 * Splits a TypeScript union type string by " | " but ignores pipes inside
 * generics, arrays, or objects (e.g. `Record<string, A | B>`).
 */
function splitUnion(typeStr: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < typeStr.length; i++) {
    const char = typeStr[i];
    if (char === "<" || char === "(" || char === "{" || char === "[") depth++;
    if (char === ">" || char === ")" || char === "}" || char === "]") depth--;

    if (depth === 0 && typeStr.slice(i, i + 3) === " | ") {
      parts.push(current.trim());
      current = "";
      i += 2; // Skip " |" (loop will i++ for the space)
    } else {
      current += char;
    }
  }
  if (current) {
    parts.push(current.trim());
  }

  return parts;
}

export function TypeDisplay({ type }: TypeDisplayProps) {
  if (!type) return null;

  const parts = splitUnion(type);

  return (
    <div className="flex flex-wrap items-center gap-1.5 leading-relaxed">
      {parts.map((part, i) => {
        // Identify string literals like '"sm"' or "'sm'"
        const stringLiteralMatch = part.match(/^["'](.*)["']$/);
        const isStringLiteral = !!stringLiteralMatch;
        const cleanPart = isStringLiteral ? stringLiteralMatch[1] : part;

        return (
          <React.Fragment key={part}>
            {isStringLiteral ? (
              <code className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {cleanPart}
              </code>
            ) : (
              <span className="font-mono text-xs text-muted-foreground whitespace-pre-wrap max-w-[200px]">
                {cleanPart}
              </span>
            )}
            {i < parts.length - 1 && (
              <span className="text-muted-foreground/40 font-mono text-xs">
                |
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
