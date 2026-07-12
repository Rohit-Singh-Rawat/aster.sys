import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeSheetTrigger } from "@/components/docs/code-sheet-trigger";
import { CollapsibleAside } from "@/components/docs/collapsible-aside";
import { CopyPrompt } from "@/components/docs/copy-prompt";
import { DemoFrame } from "@/components/docs/demo-frame";
import { InstallCommand } from "@/components/docs/install-command";
import { MainContentShell } from "@/components/docs/main-content-shell";
import { OnThisPage, type TocEntry } from "@/components/docs/on-this-page";
import { PageHeaderLinks, PageHeaderActions } from "@/components/docs/page-header";
import { PageFooter } from "@/components/docs/page-footer";
import { PageTransition } from "@/components/page-transition";
import { HeadingAnchor } from "@/components/docs/heading-anchor";
import { demoRegistry } from "@/lib/demos";
import { getComponentSlugs, getPrimitive, getComponentIndex, getPagination } from "@/lib/registry-loader";
import { GITHUB_URL, SITE_URL } from "@/lib/site";
import { slugifyHeading } from "@/lib/slugify";

/**
 * Distinct from /systems/[slug] on purpose (docs/05-site/system-page.md ->
 * D1 v2): consumer-first order (demo, install, usage, use cases, variants)
 * with the deep engineering reasoning below the fold, not above it — see
 * docs/05-site/component-page.md -> "Confirmed section order — v3".
 * Source lives only in the code sheet (components/docs/code-sheet.tsx),
 * triggered from Installation; there is no bottom Source section here.
 */
export function generateStaticParams() {
  return getComponentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const primitive = await getPrimitive(slug);
  if (!primitive || primitive.layer !== "component") {
    return { title: "Not found" };
  }
  return {
    title: primitive.title,
    description: primitive.description,
    alternates: { canonical: `/components/${slug}` },
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const primitive = await getPrimitive(slug);
  if (!primitive || primitive.layer !== "component") notFound();

  const demos = demoRegistry[slug] ?? [];
  const heroDemo = demos.find((demo) => demo.name === "hero");
  const variantsDemo = demos.find((demo) => demo.name === "variants");
  const anatomyDemo = demos.find((demo) => demo.name === "anatomy");

  const usageSection = primitive.sections.find((s) => s.heading === "Usage");
  const useCasesSection = primitive.sections.find(
    (s) => s.heading === "Use cases",
  );
  // Everything else is the deep-reasoning group, in file order: What it is,
  // Built on, Interaction spec, Accessibility, Motion, API.
  const understandingSections = primitive.sections.filter(
    (s) => s.heading !== "Usage" && s.heading !== "Use cases",
  );

  const toc: TocEntry[] = [
    ...(heroDemo ? [{ id: "demo", label: "Demo" }] : []),
    { id: "installation", label: "Installation" },
    ...(usageSection
      ? [{ id: slugifyHeading(usageSection.heading), label: "Usage" }]
      : []),
    ...(useCasesSection
      ? [{ id: slugifyHeading(useCasesSection.heading), label: "Use cases" }]
      : []),
    ...(variantsDemo ? [{ id: "variants", label: "Examples" }] : []),
    ...understandingSections.flatMap((s) => [
      { id: slugifyHeading(s.heading), label: s.heading, level: 1 },
      ...(s.subHeadings?.map((sub) => ({
        id: slugifyHeading(sub),
        label: sub,
        level: 2,
      })) ?? []),
    ]),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: primitive.title,
    description: primitive.description,
    url: `${SITE_URL}/components/${slug}`,
    codeRepository: GITHUB_URL,
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
  };

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from first-party registry content, with < escaped so nothing can close the script tag
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="flex w-full gap-4">
        <MainContentShell>
          <article className="flex min-w-0 flex-1 flex-col rounded-2xl p-4 pb-24 md:p-0 md:pb-24">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
              <header className="flex flex-col gap-3">
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
                >
                  <Link
                    href="/"
                    className="outline-none focus-ring rounded-sm transition-colors duration-(--motion-dur-fast) hover:text-foreground"
                  >
                    aster
                  </Link>
                  <span aria-hidden>›</span>
                  <Link
                    href="/components"
                    className="outline-none focus-ring rounded-sm transition-colors duration-(--motion-dur-fast) hover:text-foreground"
                  >
                    Components
                  </Link>
                  <span aria-hidden>›</span>
                  <span className="text-foreground">{primitive.title}</span>
                </nav>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-medium tracking-tight">
                      {primitive.title}
                    </h1>
                    <p className="max-w-prose text-muted-foreground mt-2 text-pretty">
                      {primitive.description}
                    </p>
                    <PageHeaderLinks links={primitive.links} />
                  </div>
                  <PageHeaderActions />
                </div>
              </header>

              {heroDemo && (
                <section id="demo" className="flex scroll-mt-24 flex-col gap-3">
                  <DemoFrame
                    name={heroDemo.name}
                    code={
                      primitive.demos.find((f) => f.name === heroDemo.name)
                        ?.code ?? ""
                    }
                  >
                    <heroDemo.Component />
                  </DemoFrame>
                </section>
              )}

              <section
                id="installation"
                className="flex scroll-mt-24 flex-col gap-3"
              >
                <h2 id="installation" className="group relative w-fit text-xl font-medium tracking-tight">
                  <HeadingAnchor id="installation" />
                  Installation
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <InstallCommand name={primitive.slug} />
                  <CodeSheetTrigger files={primitive.files} />
                  <CopyPrompt name={primitive.title} files={primitive.files} />
                </div>
              </section>

              {usageSection && <div>{usageSection.body}</div>}
              {useCasesSection && <div>{useCasesSection.body}</div>}

              {variantsDemo && (
                <section
                  id="variants"
                  className="flex scroll-mt-24 flex-col gap-3"
                >
                  <h2 id="variants" className="group relative w-fit text-xl font-medium tracking-tight">
                    <HeadingAnchor id="variants" />
                    Examples
                  </h2>
                  <DemoFrame
                    name={variantsDemo.name}
                    code={
                      primitive.demos.find((f) => f.name === variantsDemo.name)
                        ?.code ?? ""
                    }
                  >
                    <variantsDemo.Component />
                  </DemoFrame>
                </section>
              )}

              {understandingSections.length > 0 && (
                <div className="flex flex-col gap-2 mt-10">
                  {understandingSections.map((section) => (
                    <div key={section.heading}>
                      {section.body}
                      {section.heading === "What it is" && anatomyDemo && (
                        <div className="mt-8 mb-4">
                          <DemoFrame
                            name={anatomyDemo.name}
                            code=""
                          >
                            <anatomyDemo.Component />
                          </DemoFrame>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <PageFooter
                {...getPagination(slug)}
              />
            </div>
          </article>
        </MainContentShell>

        {/* right sidebar panel — collapses when the code sheet opens */}
        <CollapsibleAside>
          <div className="h-full overflow-y-auto overflow-x-hidden px-1.5 -mx-1.5">
            <OnThisPage entries={toc} />
          </div>
        </CollapsibleAside>
      </div>
    </PageTransition>
  );
}
