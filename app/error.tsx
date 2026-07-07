"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
        Error
      </p>
      <h1 className="text-2xl font-medium tracking-tight text-balance">
        Something went wrong.
      </h1>
      <p className="max-w-sm text-balance text-muted-foreground">
        An unexpected error interrupted the page. Trying again usually recovers
        it.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full bg-foreground px-5 py-2 font-medium text-background text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-foreground/85 active:scale-[0.97] motion-reduce:active:scale-100"
      >
        Try again
      </button>
    </main>
  );
}
