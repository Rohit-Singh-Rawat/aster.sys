"use client";

import { useEffect } from "react";
import { AvatarIllustration } from "@/components/logo/avatar-illustration";

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
      <div className="mb-4 text-muted-foreground text-destructive">
        <AvatarIllustration className="h-16 w-16 opacity-80" />
      </div>
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
        className="mt-4 outline-none focus-ring rounded-full bg-foreground px-5 py-2 font-medium text-background text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-foreground/85 active:scale-[0.97] motion-reduce:active:scale-100"
      >
        Try again
      </button>
    </main>
  );
}
