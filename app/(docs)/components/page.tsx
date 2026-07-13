import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { SystemsGrid } from "@/components/systems/systems-grid";
import { getComponentIndex } from "@/lib/registry-loader";

export const metadata: Metadata = {
  title: "Components",
  description: "Crafted, ready-to-use pieces built on a temporary foundation.",
  alternates: { canonical: "/components" },
};

export default function ComponentsPage() {
  const built = getComponentIndex();

  return (
    <PageTransition>
      <div className="flex flex-col items-center gap-10 p-4 pb-24 md:p-0 md:pb-24">
        <header className="flex flex-col items-center gap-2 pt-4 text-center">
          <h1 className="text-3xl font-medium tracking-tight">Components</h1>
          <p className="text-muted-foreground">
            Crafted, ready-to-use pieces — copy them in, or learn how they were
            built.
          </p>
        </header>
        <SystemsGrid built={built} planned={[]} basePath="/components" />
      </div>
    </PageTransition>
  );
}
