import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { SystemsGrid } from "@/components/systems/systems-grid";
import { plannedSystems } from "@/lib/planned-systems";
import { getComponentIndex, getSystemIndex } from "@/lib/registry-loader";

export const metadata: Metadata = {
  title: "Browse",
  description: "Systems and components, side by side.",
  alternates: { canonical: "/browse" },
};

/**
 * The entry point above /systems and /components — an overview that
 * shows both before a visitor picks a direction. Does not replace either
 * index; each keeps its own focused page. Same layout as /systems and
 * /components (full-width grid, no artificial max-width) so it reads as
 * one consistent system, not a third design. See
 * docs/05-site/system-page.md -> D1 v2 for why Systems and Components are
 * separate in the first place.
 */
export default function BrowsePage() {
  const systems = getSystemIndex();
  const components = getComponentIndex();

  return (
    <PageTransition>
      <div className="flex flex-col items-center gap-10 p-4 pb-24 md:p-0 md:pb-24">
        <header className="flex flex-col items-center gap-2 pt-4 text-center">
          <h1 className="text-3xl font-medium tracking-tight">Browse</h1>
          <p className="text-muted-foreground">
            Systems and components, side by side.
          </p>
        </header>

        <div className="flex w-full flex-col items-start gap-4">
          <h2 className="text-xl font-medium tracking-tight">Systems</h2>
          <SystemsGrid built={systems} planned={plannedSystems} />
        </div>

        <div className="flex w-full flex-col items-start gap-4">
          <h2 className="text-xl font-medium tracking-tight">Components</h2>
          <SystemsGrid built={components} planned={[]} basePath="/components" />
        </div>
      </div>
    </PageTransition>
  );
}
