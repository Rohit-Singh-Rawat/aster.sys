import { GithubIcon, StarIcon } from "hugeicons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HeroBlueprint } from "@/components/landing/hero-blueprint";
import { Logo } from "@/components/logo/logo";
import { PageTransition } from "@/components/page-transition";
import { GITHUB_REPO, GITHUB_URL } from "@/lib/site";
import pkg from "../../package.json";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Live star count; null (chip hidden) when the API is unreachable. */
async function getGitHubStars(): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    if (typeof data.stargazers_count !== "number") return null;
    return new Intl.NumberFormat("en-US").format(data.stargazers_count);
  } catch {
    return null;
  }
}

export default async function Home() {
  const stars = await getGitHubStars();
  return (
    <PageTransition>
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-24 text-center">
          <div className="relative inline-flex items-start justify-center mb-6">
            <span className="sr-only">aster</span>
            <Logo className="h-16 w-auto dark:invert sm:h-20" />
            <div className="absolute top-0 -right-8 inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-2xs font-mono text-muted-foreground backdrop-blur-sm">
              v{pkg.version}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight max-w-lg flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span>Interaction</span>
            <span className="flex items-center">
              <HeroBlueprint />
              <span className="ml-1">,</span>
            </span>
            <span className="w-full sm:hidden"></span>
            <span>crafted with intention.</span>
          </h1>

          <p className="max-w-md text-balance text-muted-foreground leading-relaxed mt-4">
            Every primitive is engineered from first principles, balancing
            accessibility, motion, performance, and composability.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <Link
              href="/browse"
              className="outline-none focus-ring rounded-full bg-foreground px-6 py-2.5 font-medium text-background text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-foreground/85 active:scale-[0.97] motion-reduce:active:scale-100"
            >
              Browse Aster
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="outline-none focus-ring group flex items-center justify-center gap-3 rounded-full border border-border px-5 py-2 font-medium text-foreground text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-muted active:scale-[0.97] motion-reduce:active:scale-100"
            >
              <span className="flex items-center gap-2">
                <GithubIcon
                  size={18}
                  className="opacity-80 transition-opacity group-hover:opacity-100"
                />
                GitHub
              </span>
              {stars !== null && (
                <div className="flex items-center gap-1.5 text-muted-foreground ml-0.5">
                  <StarIcon
                    size={16}
                    className="text-amber-400 group-hover:text-amber-500 transition-colors"
                  />
                  <span className="font-medium text-sm tabular-nums">
                    {stars}
                    <span className="sr-only"> GitHub stars</span>
                  </span>
                </div>
              )}
            </a>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
