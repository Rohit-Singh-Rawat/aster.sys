import Link from "next/link";
import type { ReactNode } from "react";

interface SystemCardProps {
  title: string;
  /** Present for built systems | the card links to its doc page. */
  href?: string;
  /**
   * The blueprint drawing. Every card is a `group`, so the blueprint morphs
   * into its implementation on hover/focus | built and planned alike; only
   * built cards additionally link to a doc page.
   */
  blueprint: ReactNode;
}

const CARD_CLASS = "rounded-2xl bg-muted/40 p-5";

export function SystemCard({ title, href, blueprint }: SystemCardProps) {
  const content = (
    <div className="mt-3 flex min-h-48 items-center justify-center pointer-events-none">
      <div className="scale-125">{blueprint}</div>
    </div>
  );

  if (!href) {
    return (
      <div className={`group relative ${CARD_CLASS} opacity-80`}>
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate font-mono text-xs text-foreground/80">
            {title}
          </span>
          <span className="font-mono text-xs text-muted-foreground/70">
            planned
          </span>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`group relative block ${CARD_CLASS} transition-all duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-muted/60 active:scale-[0.97] motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background`}
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href={href}
          className="min-w-0 truncate font-mono text-xs text-foreground/80 outline-none after:absolute after:inset-0 rounded-sm"
        >
          {title}
        </Link>
      </div>
      {content}
    </div>
  );
}
