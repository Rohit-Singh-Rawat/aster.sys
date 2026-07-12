"use client";

import { useEffect, useState } from "react";
import { cn } from "@/registry/aster/lib/cn";

export interface TocEntry {
  id: string;
  label: string;
  level?: number;
}

export function OnThisPage({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => {
        const intersecting = observed.filter((entry) => entry.isIntersecting);
        if (intersecting.length > 0) {
          intersecting.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActive(intersecting[0].target.id);
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
    <div className="relative">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        On This Page
      </p>
      <ul className="flex flex-col gap-1">
        {entries.map((entry) => {
          const isSub = (entry.level ?? 1) === 2;
          const isActive = active === entry.id;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "block text-sm outline-none transition-colors duration-(--motion-dur-fast) focus-ring",
                  isSub ? "pl-4" : "",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {entry.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
