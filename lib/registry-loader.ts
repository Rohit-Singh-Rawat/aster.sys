import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { cache, type ReactElement } from "react";
import { mdxComponents } from "@/mdx-components";

const ROOT = process.cwd();
const REGISTRY_JSON = path.join(ROOT, "registry.json");
const UI_DIR = path.join(ROOT, "registry", "aster", "ui");
/**
 * Content lives in a layer-specific directory: Systems get the deep,
 * learner-first spec (`content/systems/`), Components get the
 * consumer-first spec (`content/components/`) — see
 * docs/05-site/system-page.md -> D1 v2 for why these are separate
 * templates rather than one shared page.
 */
const CONTENT_DIRS = {
  system: path.join(ROOT, "content", "systems"),
  component: path.join(ROOT, "content", "components"),
} as const;

/**
 * Which governance track produced the item — never shown to a reader as
 * "system" or "component" verbatim; it only decides which route/template
 * and content directory apply. Missing `layer` defaults to "system" (the
 * original, pre-split shape of registry.json).
 */
export type RegistryLayer = "system" | "component";

interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

interface RegistryItem {
  name: string;
  type: string;
  layer?: RegistryLayer;
  title: string;
  description: string;
  categories?: string[];
  links?: {
    api?: string;
    doc?: string;
    github?: string;
  };
  files: RegistryFile[];
  /** Other registry items this one needs, e.g. "@aster/motion-tokens". */
  registryDependencies?: string[];
}

export interface SourceFile {
  name: string;
  code: string;
  language?: string;
}

export interface PrimitiveIndexEntry {
  slug: string;
  title: string;
  description: string;
  category?: string;
}

export interface MdxSection {
  /** The `##` heading text, verbatim. */
  heading: string;
  /** The `###` heading texts found inside this section. */
  subHeadings?: string[];
  body: ReactElement;
}

export interface PrimitiveDoc extends PrimitiveIndexEntry {
  layer: RegistryLayer;
  links?: {
    api?: string;
    doc?: string;
    github?: string;
  };
  files: SourceFile[];
  demos: SourceFile[];
  /**
   * MDX body split by top-level (`##`) heading, each compiled separately.
   * Split (not one blob) so a page can interleave live components between
   * sections — e.g. the Components page inserts a Variants demo between
   * "Use cases" and "Built on". The System page just concatenates every
   * section in order, which reproduces the old single-blob rendering
   * exactly. Look sections up by `heading`, not array position — content
   * authors write MDX in whatever order reads naturally in prose.
   */
  sections: MdxSection[];
  /** Text of `##` headings, in document order — same set as `sections`. */
  headings: string[];
}

// React.cache: layout, index page, and metadata all read the registry in the
// same request - parse the JSON once per request instead of once per caller.
const readRegistry = cache((): RegistryItem[] => {
  const raw = fs.readFileSync(REGISTRY_JSON, "utf-8");
  return (JSON.parse(raw).items ?? []) as RegistryItem[];
});

/**
 * Every file a registry item actually needs to work, walking
 * `registryDependencies` transitively (e.g. Fader -> use-elastic-overdrag
 * -> motion-tokens) and deduping by path. The CLI install flow needs
 * `registryDependencies` to stay a list of item NAMES, not inlined file
 * content — shadcn installs each dependency as its own registry item, so
 * duplicating content here would fight that. This resolves the full set
 * separately, for display only (the Source sheet): a visitor asking "what
 * does this actually depend on" shouldn't have to go find those items
 * themselves.
 */
function resolveAllFiles(item: RegistryItem): RegistryFile[] {
  const registry = readRegistry();
  const seenPaths = new Set<string>();
  const seenItems = new Set<string>();
  const result: RegistryFile[] = [];

  function visit(current: RegistryItem) {
    if (seenItems.has(current.name)) return;
    seenItems.add(current.name);

    for (const file of current.files) {
      if (seenPaths.has(file.path)) continue;
      seenPaths.add(file.path);
      result.push(file);
    }

    for (const depName of current.registryDependencies ?? []) {
      const dep = registry.find(
        (candidate) => `@aster/${candidate.name}` === depName,
      );
      if (dep) visit(dep);
    }
  }

  visit(item);
  return result;
}

function indexForLayer(layer: RegistryLayer): PrimitiveIndexEntry[] {
  return readRegistry()
    .filter(
      (item) =>
        item.type === "registry:ui" && (item.layer ?? "system") === layer,
    )
    .map((item) => ({
      slug: item.name,
      title: item.title,
      description: item.description,
      category: item.categories?.[0],
    }));
}

/** Full-lifecycle primitives (docs/04-primitives/) — the deep, learner-first pages at /systems. */
export function getSystemIndex(): PrimitiveIndexEntry[] {
  return indexForLayer("system");
}

/** Pragmatic builds over a temporary primitive (docs/06-components/) — the consumer-first pages at /components. */
export function getComponentIndex(): PrimitiveIndexEntry[] {
  return indexForLayer("component");
}

export interface PaginationEntry extends PrimitiveIndexEntry {
  layer: RegistryLayer;
}

export function getPagination(slug: string): {
  previous: PaginationEntry | null;
  next: PaginationEntry | null;
} {
  const systems = getSystemIndex().map((s) => ({
    ...s,
    layer: "system" as const,
  }));
  const components = getComponentIndex().map((c) => ({
    ...c,
    layer: "component" as const,
  }));
  const all = [...systems, ...components];
  const idx = all.findIndex((entry) => entry.slug === slug);
  if (idx === -1) return { previous: null, next: null };
  return {
    previous: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export function getSystemSlugs(): string[] {
  return getSystemIndex().map((entry) => entry.slug);
}

export function getComponentSlugs(): string[] {
  return getComponentIndex().map((entry) => entry.slug);
}

// cache(): generateMetadata and the page both call this in the same request —
// without it every doc page re-reads all files and re-compiles MDX twice.
export const getPrimitive = cache(
  async (slug: string): Promise<PrimitiveDoc | null> => {
    const item = readRegistry().find(
      (candidate) =>
        candidate.type === "registry:ui" && candidate.name === slug,
    );
    if (!item) return null;
    const layer = item.layer ?? "system";

    const files: SourceFile[] = resolveAllFiles(item)
      .filter((file) => fs.existsSync(path.join(ROOT, file.path)))
      .map((file) => ({
        name: path.basename(file.path),
        code: fs.readFileSync(path.join(ROOT, file.path), "utf-8"),
        language: path.extname(file.path).slice(1) || "tsx",
      }));

    const demosDir = path.join(UI_DIR, slug, "demos");
    const demos: SourceFile[] = fs.existsSync(demosDir)
      ? fs
          .readdirSync(demosDir)
          .filter((file) => file.endsWith(".tsx"))
          .sort()
          .map((file) => ({
            name: file.replace(/\.tsx$/, ""),
            code: fs.readFileSync(path.join(demosDir, file), "utf-8"),
            language: "tsx",
          }))
      : [];

    if (demos.length === 0 && process.env.NODE_ENV !== "production") {
      console.warn(`[registry-loader] primitive "${slug}" has no demos`);
    }

    let sections: MdxSection[] = [];
    const mdxPath = path.join(CONTENT_DIRS[layer], `${slug}.mdx`);
    if (fs.existsSync(mdxPath)) {
      const raw = fs.readFileSync(mdxPath, "utf-8");
      // Frontmatter (`title:`) is decorative only — title comes from
      // registry.json — so it's stripped rather than parsed per section.
      const source = raw.replace(/^---[\s\S]*?---\n*/, "");
      // Split on every `##` heading line, keeping the heading with its
      // section (lookahead so the delimiter isn't consumed).
      const parts = source.split(/(?=^##\s)/m).filter((part) => part.trim());
      sections = await Promise.all(
        parts.map(async (part) => {
          const heading = part.match(/^##\s+(.+)$/m)?.[1].trim() ?? "";
          const subHeadings = Array.from(part.matchAll(/^###\s+(.+)$/gm)).map(
            (m) => m[1].trim(),
          );
          const compiled = await compileMDX({
            source: part,
            components: mdxComponents,
            options: { parseFrontmatter: false, blockJS: false },
          });
          return { heading, subHeadings, body: compiled.content };
        }),
      );
    }

    return {
      slug,
      layer,
      title: item.title,
      description: item.description,
      category: item.categories?.[0],
      links: item.links,
      files,
      demos,
      sections,
      headings: sections.map((section) => section.heading),
    };
  },
);
