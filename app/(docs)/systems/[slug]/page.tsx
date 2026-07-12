import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoFrame } from "@/components/docs/demo-frame";
import { InstallCommand } from "@/components/docs/install-command";
import { OnThisPage, type TocEntry } from "@/components/docs/on-this-page";
import { SourceTabs } from "@/components/docs/source-tabs";
import { PageTransition } from "@/components/page-transition";
import { HeadingAnchor } from "@/components/docs/heading-anchor";
import { PageFooter } from "@/components/docs/page-footer";
import { demoRegistry } from "@/lib/demos";
import { getPrimitive, getSystemSlugs, getPagination } from "@/lib/registry-loader";
import { GITHUB_URL, SITE_URL } from "@/lib/site";
import { slugifyHeading } from "@/lib/slugify";

export function generateStaticParams() {
  return getSystemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const primitive = await getPrimitive(slug);
  if (!primitive || primitive.layer !== "system") {
    return { title: "Not found" };
  }
  return {
    title: primitive.title,
    description: primitive.description,
    alternates: { canonical: `/systems/${slug}` },
  };
}

export default async function SystemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const primitive = await getPrimitive(slug);
  if (!primitive || primitive.layer !== "system") notFound();

  const demos = demoRegistry[slug] ?? [];

  const toc: TocEntry[] = [
    ...(demos.length > 0 ? [{ id: "preview", label: "Preview" }] : []),
    ...primitive.headings.map((heading) => ({
      id: slugifyHeading(heading),
      label: heading,
    })),
    ...(primitive.files.length > 0 ? [{ id: "source", label: "Source" }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: primitive.title,
    description: primitive.description,
    url: `${SITE_URL}/systems/${slug}`,
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
                  href="/systems"
                  className="outline-none focus-ring rounded-sm transition-colors duration-(--motion-dur-fast) hover:text-foreground"
                >
                  Systems
                </Link>
                <span aria-hidden>›</span>
                <span className="text-foreground">{primitive.title}</span>
              </nav>
              <h1 className="text-3xl font-medium tracking-tight">
                {primitive.title}
              </h1>
              <p className="max-w-prose text-pretty text-muted-foreground mt-2">
                {primitive.description}
              </p>
              <InstallCommand name={primitive.slug} />
            </header>

            {demos.length > 0 && (
              <section
                id="preview"
                className="flex scroll-mt-24 flex-col gap-6"
              >
                {demos.map((demo) => {
                  const source = primitive.demos.find(
                    (file) => file.name === demo.name,
                  );
                  return (
                    <DemoFrame
                      key={demo.name}
                      name={demo.name}
                      code={source?.code ?? ""}
                    >
                      <demo.Component />
                    </DemoFrame>
                  );
                })}
              </section>
            )}

            {primitive.sections.map((section) => (
              <div key={section.heading}>{section.body}</div>
            ))}

            {primitive.files.length > 0 && (
              <section id="source" className="flex scroll-mt-24 flex-col gap-3">
                <h2 id="source" className="group relative w-fit text-xl font-medium tracking-tight">
                  <HeadingAnchor id="source" />
                  Source
                </h2>
                <SourceTabs files={primitive.files} />
              </section>
            )}
            
            <PageFooter {...getPagination(slug)} />
          </div>
        </article>

        {/* right sidebar panel */}
        <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-2xl bg-muted/40 p-6 xl:flex">
          <OnThisPage entries={toc} />
        </aside>
      </div>
    </PageTransition>
  );
}
