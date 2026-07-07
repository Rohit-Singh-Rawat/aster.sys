"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarEntry {
  slug: string;
  title: string;
}

/**
 * Docs sidebar list: built systems link to their pages (active one
 * highlighted); planned systems sit dimmed and inert, BoardUI-style.
 */
export function SidebarNav({
  built,
  planned,
}: {
  built: SidebarEntry[];
  planned: SidebarEntry[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      <div>
        <ul className="flex flex-col gap-0.5">
          {built.map((entry) => {
            const href = `/systems/${entry.slug}`;
            const active = pathname === href;
            return (
              <li key={entry.slug}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`block truncate rounded-lg px-2 py-1.5 text-sm outline-none transition-colors duration-(--motion-dur-fast) focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-foreground/75 hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {entry.title}
                </Link>
              </li>
            );
          })}
          {planned.map((entry) => (
            <li key={entry.slug}>
              <span className="block cursor-default rounded-lg px-2 py-1.5 text-sm text-muted-foreground/50">
                {entry.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
