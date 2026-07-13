"use client";

import Link from "next/link";

export function HeadingAnchor({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <Link
      href={`#${id}`}
      className="absolute -left-6 top-1/2 -translate-y-1/2 flex w-6 items-center justify-center opacity-0 blur-sm translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:blur-none group-hover:translate-x-0 focus-visible:opacity-100 focus-visible:blur-none focus-visible:translate-x-0 focus-ring rounded-sm max-md:hidden"
      aria-label="Link to this section"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </Link>
  );
}
