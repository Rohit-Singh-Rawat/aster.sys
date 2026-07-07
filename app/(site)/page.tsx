import type { Metadata } from "next";
import Link from "next/link";
import { HeroBlueprint } from "@/components/landing/hero-blueprint";
import { Logo } from "@/components/logo/logo";
import { PageTransition } from "@/components/page-transition";
import { GITHUB_REPO, GITHUB_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Live star count; null (chip hidden) when the API is unreachable. */
async function getGitHubStars(): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      next: { revalidate: 3600 },
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
              v0.1.0
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
              href="/systems"
              className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full bg-foreground px-6 py-2.5 font-medium text-background text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-foreground/85 active:scale-[0.97] motion-reduce:active:scale-100"
            >
              Browse systems
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background group flex items-center justify-center gap-3 rounded-full border border-border px-5 py-2 font-medium text-foreground text-sm transition-[background-color,scale] duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:bg-muted active:scale-[0.97] motion-reduce:active:scale-100"
            >
              <span className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="opacity-80 transition-opacity group-hover:opacity-100"
                >
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                  />
                </svg>
                GitHub
              </span>
              {stars !== null && (
                <div className="flex items-center gap-1.5 text-muted-foreground ml-0.5">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="text-amber-400 group-hover:text-amber-500 transition-colors"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      d="M9.153 5.408C10.42 3.136 11.053 2 12 2s1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182s.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776c.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18c-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506s-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452s-.674.15-1.328.452l-.596.274c-2.303 1.06-3.455 1.59-4.22 1.01c-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46c-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882S3.58 8.328 6.04 7.772l.636-.144c.699-.158 1.048-.237 1.329-.45s.46-.536.82-1.182z"
                    />
                  </svg>
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
