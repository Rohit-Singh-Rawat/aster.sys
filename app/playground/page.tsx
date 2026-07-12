import type { Metadata } from "next";
import { experiments } from "@/components/playground/experiments";
import { ThemeConfigurator } from "@/components/playground/theme-configurator";
import { ThemeProvider } from "@/components/playground/theme-context";

export const metadata: Metadata = {
  title: "Playground",
  description: "Workbench for components in progress — not a release surface.",
  robots: { index: false, follow: false },
};

export default function PlaygroundPage() {
  return (
    <ThemeProvider>
      <ThemeConfigurator />
      <div className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <header className="mb-10">
            <h1 className="mt-2 font-medium text-2xl tracking-tight">
              Playground
            </h1>
          </header>

          <ul className="flex flex-col gap-4">
            {experiments.map((exp) => (
              <li key={exp.slug} className="rounded-2xl">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-medium">{exp.name}</h2>
                </div>
                <div className="mt-6">
                  {exp.Component ? (
                    <exp.Component />
                  ) : (
                    <div className="rounded-xl border border-border border-dashed px-4 py-8 text-center font-mono text-muted-foreground text-xs">
                      no prototype yet — design discussion in progress
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ThemeProvider>
  );
}
