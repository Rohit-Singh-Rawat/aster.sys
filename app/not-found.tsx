import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-medium tracking-tight text-balance">
        This page hasn&rsquo;t been drawn yet.
      </h1>
      <p className="max-w-sm text-balance text-muted-foreground">
        The blueprint you&rsquo;re looking for doesn&rsquo;t exist. Start from
        the systems index or head back home.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link
          href="/systems"
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full bg-foreground px-5 py-2 font-medium text-background text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-foreground/85 active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Browse systems
        </Link>
        <Link
          href="/"
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full border border-border px-5 py-2 font-medium text-foreground text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-muted active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
