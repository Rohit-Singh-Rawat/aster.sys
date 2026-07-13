"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarEntry {
  slug: string;
  title: string;
}

function NavSection({
  label,
  basePath,
  built,
  planned,
  pathname,
}: {
  label: string;
  basePath: string;
  built: SidebarEntry[];
  planned: SidebarEntry[];
  pathname: string;
}) {
  if (built.length === 0 && planned.length === 0) return null;
  return (
    <div>
      <span className="block px-2 pb-1.5 font-mono text-[11px] text-muted-foreground/70 lowercase tracking-wide">
        {label}
      </span>
      <ul className="flex flex-col gap-0.5">
        {built.map((entry) => {
          const href = `${basePath}/${entry.slug}`;
          const active = pathname === href;
          return (
            <li key={entry.slug}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`block truncate rounded-lg px-2 py-1.5 text-sm outline-none transition-colors duration-(--motion-dur-fast) focus-ring ${
                  active
                    ? "bg-muted dark:bg-white/15 text-foreground dark:text-white"
                    : "text-foreground/75 hover:bg-muted/60 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white"
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
  );
}

/**
 * Docs sidebar: Systems and Components are separate sections — same card
 * styling and interaction pattern, different content depth per page (see
 * docs/05-site/system-page.md -> D1 v2). Built entries link to their
 * page (active one highlighted); planned entries (Systems only, for now)
 * sit dimmed and inert, BoardUI-style.
 */
export function SidebarNav({
  systems,
  plannedSystems,
  components,
}: {
  systems: SidebarEntry[];
  plannedSystems: SidebarEntry[];
  components: SidebarEntry[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      <NavSection
        label="Systems"
        basePath="/systems"
        built={systems}
        planned={plannedSystems}
        pathname={pathname}
      />
      <NavSection
        label="Components"
        basePath="/components"
        built={components}
        planned={[]}
        pathname={pathname}
      />
    </nav>
  );
}
