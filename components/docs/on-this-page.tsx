"use client";

import { useEffect, useState } from "react";

export interface TocEntry {
  id: string;
  label: string;
}

/**
 * "On this page" rail: anchors to page sections, tracking the one currently
 * in view with an IntersectionObserver.
 */
export function OnThisPage({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            return;
          }
        }
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    for (const { id } of entries) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
        On this page
      </p>
      <ul className="flex flex-col">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={`block border-l py-1 pl-3 text-sm outline-none transition-colors duration-(--motion-dur-fast) focus-visible:ring-2 focus-visible:ring-ring ${
                active === entry.id
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
